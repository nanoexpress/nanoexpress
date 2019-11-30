export default function(stream) {
  const { _onDataHandlers } = this;

  // Polyfill unimplemented methods
  if (stream._read === undefined) {
    stream._read = () => true;
  }

  _onDataHandlers.push((chunkPart, isLast) => {
    stream.write(chunkPart);
    if (isLast) {
      stream.end();
    }
  });

  return this;
}
