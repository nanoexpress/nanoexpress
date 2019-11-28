import { getMime } from './mime.js';
import compressStream from './compress-stream.js';
import { statSync, createReadStream } from 'fs';

export default function(path, lastModified = true) {
  const res = this;
  const { headers, onAborted } = res.__request;
  const responseHeaders = {};

  const stat = statSync(path);
  let { size } = stat;
  let isAborted = false;

  onAborted(() => {
    isAborted = true;
  });

  // handling last modified
  if (lastModified) {
    const { mtime } = stat;

    mtime.setMilliseconds(0);
    const mtimeutc = mtime.toUTCString();

    // Return 304 if last-modified
    if (headers && headers['if-modified-since']) {
      if (new Date(headers['if-modified-since']) >= mtime) {
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }
    responseHeaders['last-modified'] = mtimeutc;
  }
  responseHeaders['content-type'] = getMime(path);

  // write data
  let start = 0,
    end = size - 1;

  if (headers && headers.range) {
    [start, end] = headers.range
      .substr(6)
      .split('-')
      .map((byte) => (byte ? parseInt(byte, 10) : undefined));

    // Chrome patch for work
    if (end === undefined) {
      end = size - 1;
    }

    if (start !== undefined) {
      res.writeStatus('206 Partial Content');
      responseHeaders['accept-ranges'] = 'bytes';
      responseHeaders['content-range'] = `bytes ${start}-${end}/${size}`;
      size = end - start + 1;
    }
  }

  // for size = 0
  if (end < 0) {
    end = 0;
  }

  let compressed = false;

  let readStream = createReadStream(path, { start, end });

  const compressedReadStream = compressStream(readStream, headers);

  if (compressedReadStream) {
    readStream = compressedReadStream;
    compressed = true;
  }

  res.writeHeaders(responseHeaders);

  if (compressed) {
    readStream.on('data', (buffer) => {
      if (isAborted) {
        readStream.destroy();
        return;
      }
      res.write(
        buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        )
      );
    });
  } else {
    readStream.on('data', (buffer) => {
      if (isAborted) {
        readStream.destroy();
        return;
      }
      buffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const lastOffset = res.getWriteOffset();

      // First try
      const [ok, done] = res.tryEnd(buffer, size);

      if (done) {
        readStream.destroy();
      } else if (!ok) {
        // pause because backpressure
        readStream.pause();

        // Register async handlers for drainage
        res.onWritable((offset) => {
          const [ok, done] = res.tryEnd(
            buffer.slice(offset - lastOffset),
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
      if (!isAborted) {
        res.writeStatus('500 Internal server error');
        res.end();
      }
      readStream.destroy();
    })
    .on('end', () => {
      if (!isAborted) {
        res.end();
      }
    });
}
