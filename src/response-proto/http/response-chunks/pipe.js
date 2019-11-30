import compressStream from '../../../helpers/compress-stream.js';

export default function(stream, size = Infinity) {
  const { __request: req } = this;
  const { onAborted, headers } = req;
  let isAborted = false;

  let compressed = false;
  const compressedStream = compressStream(stream, headers);

  onAborted(() => {
    if (stream) {
      stream.destroy();
    }
    if (compressedStream) {
      compressedStream.destroy();
    }
    isAborted = true;
  });

  if (compressedStream) {
    stream = compressedStream;
    compressed = true;
  }

  if (compressed) {
    stream.on('data', (buffer) => {
      this.write(
        buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        )
      );
    });
  } else {
    stream.on('data', (buffer) => {
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
          const [ok, done] = this.tryEnd(
            buffer.slice(offset - lastOffset),
            size
          );
          if (done) {
            stream.destroy();
          } else if (ok) {
            stream.resume();
          }
          return ok;
        });
      }
    });
  }
  stream
    .on('error', () => {
      if (!isAborted) {
        this.writeStatus('500 Internal server error');
        this.end();
      }
      stream.destroy();
    })
    .on('end', () => {
      if (!isAborted) {
        this.end();
      }
    });
  return this;
}
