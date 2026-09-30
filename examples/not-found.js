import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', (_req, res) => {
  res.end('{"hello":"world"}');
});
app.get('/b', (_req, res) => {
  res.end('route /b');
});
app.any((_req, res) => {
  res.end('Not Found');
});

app.listen(4000);
