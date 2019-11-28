export default (readableStream, writableStream, convertBuffer = false) => {
  readableStream.on('data', (buffer) => {
    // Convert Buffer to ArrayBuffer
    if (convertBuffer) {
      buffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
    }

    writableStream.write(buffer);
  });
  readableStream.on('end', () => {
    writableStream.end();
  });
  readableStream.on('error', () => {
    readableStream.destroy();
  });
  return writableStream;
};
