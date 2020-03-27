const SPACE_TRIM_REGEX = /\n|\t/g;

export default (req) =>
  req.stream &&
  new Promise((resolve, reject) => {
    let buffer;

    req.stream.on('data', (chunk) => {
      buffer = buffer ? Buffer.concat([buffer, chunk]) : chunk;
    });
    req.stream.once('end', () => {
      req.buffer = buffer;
      req.body = buffer.toString('utf8').replace(SPACE_TRIM_REGEX, '');
      resolve();
    });
    req.stream.once('error', (err) => {
      req.stream.destroy();
      reject(err);
    });
  });
