import { getMime } from '@sifrr/server/src/server/mime';
import strToBuf from '@sifrr/server/src/server/streamtobuffer';
import fs from 'fs';
import zlib from 'zlib';

const compressions = {
  br: zlib.createBrotliCompress,
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};
const bytes = 'bytes=';

export default (res) => (
  path,
  {
    lastModified = true,
    compress = false,
    compressionOptions = {
      priority: ['gzip', 'br', 'deflate']
    },
    cache = false
  } = {}
) => {
  const stat = fs.statSync(path);
  const { mtime } = stat;
  let { size } = stat;

  mtime.setMilliseconds(0);
  const mtimeutc = mtime.toUTCString();

  const { headers } = res.__request;
  // handling last modified
  if (lastModified) {
    // Return 304 if last-modified
    if (headers['if-modified-since']) {
      if (new Date(headers['if-modified-since']) >= mtime) {
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }
    headers['last-modified'] = mtimeutc;
  }
  headers['content-type'] = getMime(path);

  // write data
  let start = 0,
    end = size - 1;

  if (headers.range) {
    compress = false;
    const parts = headers.range.replace(bytes, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    headers['accept-ranges'] = 'bytes';
    headers['content-range'] = `bytes ${start}-${end}/${size}`;
    size = end - start + 1;
    res.writeStatus('206 Partial Content');
  }

  // for size = 0
  if (end < 0) {
    end = 0;
  }

  let readStream = fs.createReadStream(path, { start, end });
  // Compression;
  let compressed = false;
  if (compress) {
    const l = compressionOptions.priority.length;
    for (let i = 0; i < l; i++) {
      const type = compressionOptions.priority[i];
      if (headers['accept-encoding'].indexOf(type) > -1) {
        compressed = true;
        const compressor = compressions[type](compressionOptions);
        readStream.pipe(compressor);
        readStream = compressor;
        headers['content-encoding'] = compressionOptions.priority[i];
        break;
      }
    }
  }

  res.onAborted(() => {
    readStream.destroy();
    res.aborted = true;
  });
  res.setHeaders(headers);
  // check cache
  if (cache && !compressed) {
    return cache.wrap(
      `${path}_${mtimeutc}_${start}_${end}`,
      (cb) => {
        strToBuf(readStream)
          .then((b) => cb(null, b.toString('utf-8')))
          .catch(cb);
      },
      { ttl: 0 },
      (err, string) => {
        if (err) {
          res.writeStatus('500 Internal server error');
          res.end();
          throw err;
        }
        res.end(string);
      }
    );
  } else if (compressed) {
    readStream.on('data', (buffer) => {
      res.write(
        buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        )
      );
    });
  } else {
    readStream.on('data', (buffer) => {
      const chunk = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        ),
        lastOffset = res.getWriteOffset();

      // First try
      const [ok, done] = res.tryEnd(chunk, size);

      if (done) {
        readStream.destroy();
      } else if (!ok) {
        // pause because backpressure
        readStream.pause();

        // Save unsent chunk for later
        res.ab = chunk;
        res.abOffset = lastOffset;

        // Register async handlers for drainage
        res.onWritable((offset) => {
          const [ok, done] = res.tryEnd(
            res.ab.slice(offset - res.abOffset),
            size
          );
          if (done) {
            readStream.destroy();
          } else if (ok) {
            readStream.resume();
          }
          return ok;
        });
      }
    });
  }
  readStream
    .on('error', () => {
      res.writeStatus('500 Internal server error');
      res.end();
      readStream.destroy();
    })
    .on('end', () => {
      res.end();
    });
};
