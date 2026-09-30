import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get(
  '/',
  {
    isRaw: true
  },
  (_req, res) => {
    res.end('hello world');
  }
);

app.listen(4000);
