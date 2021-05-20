export default (req) =>
  req.stream &&
  new Promise((resolve, reject) => {
    if (!req.headers) {
      return resolve();
    }
    if (
      req.headers['content-type'] &&
      req.headers['content-type'].indexOf('multipart/') === 0
    ) {
      return resolve();
    }
    if (
      req.headers['content-length'] &&
      +req.headers['content-length'] > 512_000
    ) {
      return resolve();
    }

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
