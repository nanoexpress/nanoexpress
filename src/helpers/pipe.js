export default (
  readableStream,
  writableStream,
  convertBuffer = false,
  size
) => {
  readableStream.on('data', (buffer) => {
    // Convert Buffer to ArrayBuffer
    if (convertBuffer) {
      buffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
    }
    if (convertBuffer && size) {
      const [ok, done] = writableStream.tryEnd(buffer, size);

      if (done) {
        if (writableStream.id !== -1) {
          writableStream.id = -1;
          readableStream.destroy();
        }
      } else if (!ok) {
        readableStream.pause();

        let lastChunk = buffer;
        let lastChunkOffset = writableStream.getWriteOffset();

        writableStream.onWritable((offset) => {
          if (offset > lastChunkOffset) {
            lastChunk = lastChunk.slice(offset - lastChunkOffset);
          }
          const [ok, done] = writableStream.tryEnd(lastChunk, size);

          lastChunkOffset = offset;

          if (done) {
            if (writableStream.id !== -1) {
              writableStream.id = -1;
              readableStream.destroy();
            }
          } else if (ok) {
            readableStream.resume();
          }

          return ok;
        });
      }
    } else {
      writableStream.write(buffer);
    }
  });
  readableStream.on('end', () => {
    if (size === undefined) {
      writableStream.end();
    }
  });
  readableStream.on('error', () => {
    if (size === undefined) {
      writableStream.writeStatus('500 Internal server error');
      writableStream.end();
    }
    readableStream.destroy();
  });
  return writableStream;
};
