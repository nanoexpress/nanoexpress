export default (req) =>
  req.stream &&
  new Promise((resolve, reject) => {
    let buffer;

    req.stream.on('data', (chunk) => {
      buffer = buffer ? Buffer.concat([buffer, chunk]) : chunk;
    });
    req.stream.once('end', () => {
      req.body = buffer;
      resolve();
    });
    req.stream.once('error', (err) => {
      req.stream.destroy();
      reject(err);
    });
  });
