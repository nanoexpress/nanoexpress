import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.setErrorHandler((err, _req, res) => {
  res.end(`error handled: ${err.message}`);
});

app.setNotFoundHandler((_req, res) => {
  res.end('you accessing to missing route??');
});

app.setValidationErrorHandler((errors, _req, res) => {
  res.end(`validation errors, ${JSON.stringify(errors)}`);
});

app.get(
  '/',
  (_req, _res, next) => {
    next(new Error('Test error'));
  },
  (_req, res) => {
    res.end('hello world');
  }
);
app.get('/bar', async (_req, res) => {
  throw new Error('Something was wrong in GET /bar');
  // biome-ignore lint/correctness/noUnreachable: example intentionally shows unreachable handler
  res.send({ status: 'success' });
});

app.listen(4000);
