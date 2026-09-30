import withResolvers from '../../helpers/with-resolvers.js';

export default (req) => {
  if (!req.stream) {
    return;
  }
  const { promise, resolve, reject } = withResolvers();
  const length = req.headers['content-length'];

  if (!req.headers || !length) {
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
    +req.headers['content-length'] > 2_048_000
  ) {
    return resolve();
  }

  let offset = 0;
  const ab = new Uint8Array(+req.headers['content-length']);

  req.stream.on('data', (/** @type {Uint8Array} */ chunk) => {
    ab.set(chunk, offset);
    offset += chunk.byteLength;
  });
  req.stream.once('end', () => {
    // zero-copy view over the assembled buffer (avoids re-copying the body)
    req.body = Buffer.from(ab.buffer, 0, offset);
    resolve();
  });
  req.stream.once('error', (err) => {
    req.stream.destroy();
    reject(err);
  });

  return promise;
};
