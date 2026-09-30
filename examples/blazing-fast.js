import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

await app.get('/', { precompile: true }, (_req, res) => {
  return res.end('hello world');
});

await app.listen(4000);
