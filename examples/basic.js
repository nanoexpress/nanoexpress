import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress({
  strictPath: true
});

app.get(
  '/',
  {
    isStrictRaw: true
  },
  (req, res) => {
    res.end('hello world');
  }
);

app.listen(4000);
