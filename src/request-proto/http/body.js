export default (req) =>
  req.stream &&
  new Promise((resolve, reject) => {
    const buffers = [];

    req.stream.on('data', (chunk) => {
      buffers.push(chunk);
    });
    req.stream.once('end', () => {
      req.body = Buffer.concat(buffers);
      resolve();
    });
    req.stream.once('error', (err) => {
      req.stream.destroy();
      reject(err);
    });
  });
