import compressStream from '../../../helpers/compress-stream.js';

export default function pipe(stream, size, compressed = false) {
  const { __request: req } = this;
  const { onAborted, headers, responseHeaders } = req;
  let isAborted = false;

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
    stream.on('data', (buffer) => {
      if (isAborted) {
        stream.destroy();
        return;
      }
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

  return this;
}
