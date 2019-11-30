export default function(req) {
  const { _onDataHandlers } = req;
  return new Promise((resolve) => {
    let buffer;
    _onDataHandlers.push((chunk, isLast) => {
      if (isLast) {
        if (buffer) {
          resolve(Buffer.concat([buffer, chunk]).toString('utf8'));
        } else {
          resolve(chunk.toString('utf8'));
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
}
