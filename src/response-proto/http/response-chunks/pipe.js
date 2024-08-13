import compressStream from '../../../helpers/compress-stream.js';

/**
 * @param {import('node:fs').ReadStream} stream
 * @param {number} size
 * @param {boolean} compressed
 * @returns
 */

export default function pipe(_stream, size, compressed = false) {
  const { __request: req } = this;
  const { onAborted, headers, responseHeaders } = req;
  let isAborted = false;
  let stream = _stream;

  this.stream = true;

  if (compressed) {
    const compressedStream = compressStream(stream, responseHeaders || headers);

    if (compressedStream) {
      stream = compressedStream;
    }
  }

  onAborted(() => {
    if (stream) {
      stream.destroy();
    }
    isAborted = true;
  });

  return this.cork(() => {
    this.corked = true;

    if (compressed || !size) {
      stream.on('data', (buffer) => {
        if (isAborted) {
          stream.destroy();
          return;
        }
        this.write(
          buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
          )
        );
      });
    } else {
      stream.on('data', (_buffer) => {
        if (isAborted) {
          stream.destroy();
          return;
        }
        let buffer = _buffer;

        buffer = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        );
        const lastOffset = this.getWriteOffset();

        // First try
        const [ok, done] = this.tryEnd(buffer, size);

        if (done) {
          stream.destroy();
        } else if (!ok) {
          // pause because backpressure
          stream.pause();

          // Register async handlers for drainage
          this.onWritable((offset) => {
            if (isAborted) {
              stream.destroy();
              return;
            }
            const [writeOk, writeDone] = this.tryEnd(
              buffer.slice(offset - lastOffset),
              size
            );
            if (writeDone) {
              stream.end();
            } else if (writeOk) {
              stream.resume();
            }
            return writeOk;
          });
        }
      });
    }
    stream
      .on('error', () => {
        stream.destroy();
        if (!isAborted) {
          this.stream = -1;
          this.writeStatus('500 Internal server error');
          this.end();
        }
      })
      .on('end', () => {
        if (!isAborted) {
          this.stream = 1;
          this.end();
        }
      });
  });
}
