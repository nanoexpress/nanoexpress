export default (req) => {
  const { _onDataHandlers } = req;
  return new Promise((resolveBody) => {
    let buffer;
    _onDataHandlers.push((chunk, isLast) => {
      if (isLast) {
        if (buffer) {
          resolveBody(Buffer.concat([buffer, chunk]).toString('utf8'));
        } else {
          resolveBody(chunk.toString('utf8'));
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      }
    });
  });
};
