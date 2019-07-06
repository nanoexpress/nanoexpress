import fs from 'fs';
import zlib from 'zlib';
import util from 'util';

const fsStat = util.promisify(fs.stat);

import writeHeaders from './write-headers';
import { getMime } from './mime';
import stob from './stream-to-buffer';

const compressions = {
  br: zlib.createBrotliCompress,
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};
const bytes = 'bytes=';

export default async function sendFile(res, req, path, options) {
  if (!res.abortHandler) {
    res.onAborted(() => {
      if (res.stream) {
        res.stream.destroy();
      }
      res.aborted = true;
    });
    res.abortHandler = true;
  }
  return await sendFileToRes(
    res,
    {
      'if-modified-since': req.getHeader('if-modified-since'),
      range: req.getHeader('range'),
      'accept-encoding': req.getHeader('accept-encoding')
    },
    path,
    options
  );
}

async function sendFileToRes(
  res,
  reqHeaders,
  path,
  {
    lastModified = true,
    headers,
    compress = false,
    compressionOptions = {
      priority: ['gzip', 'br', 'deflate']
    },
    cache = false
  } = {}
) {
  // eslint-disable-next-line prefer-const
  let { mtime, size } = await fsStat(path);
  mtime.setMilliseconds(0);
  const mtimeutc = mtime.toUTCString();

  headers = Object.assign({}, headers);
  // handling last modified
  if (lastModified) {
    // Return 304 if last-modified
    if (reqHeaders['if-modified-since']) {
      if (new Date(reqHeaders['if-modified-since']) >= mtime) {
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

  if (reqHeaders.range) {
    compress = false;
    const parts = reqHeaders.range.replace(bytes, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    headers['accept-ranges'] = 'bytes';
    headers['content-range'] = `bytes ${start}-${end}/${size}`;
    size = end - start + 1;
    res.writeStatus('206 Partial Content');
  }

  // for size = 0
  if (end < 0) end = 0;

  let readStream = fs.createReadStream(path, { start, end });
  res.stream = readStream;

  // Compression;
  let compressed = false;
  if (compress) {
    const l = compressionOptions.priority.length;
    for (let i = 0; i < l; i++) {
      const type = compressionOptions.priority[i];
      if (reqHeaders['accept-encoding'].indexOf(type) > -1) {
        compressed = type;
        const compressor = compressions[type](compressionOptions);
        readStream.pipe(compressor);
        readStream = compressor;
        headers['content-encoding'] = compressionOptions.priority[i];
        break;
      }
    }
  }

  res.onAborted(() => readStream.destroy());
  writeHeaders(res, headers);
  // check cache
  if (cache) {
    return cache.wrap(
      `${path}_${mtimeutc}_${start}_${end}_${compressed}`,
      (cb) => {
        stob(readStream)
          .then((b) => cb(null, b))
          .catch(cb);
      },
      { ttl: 0 },
      (err, buffer) => {
        if (err) {
          res.writeStatus('500 Internal server error');
          res.end();
          throw err;
        }
        res.end(buffer);
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
}
