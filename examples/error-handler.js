import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.setErrorHandler((err, req, res) => {
  res.end('error handled: ' + err.message);
});

app.setNotFoundHandler((req, res) => {
  res.end('you accessing to missing route??');
});

app.setValidationErrorHandler((errors, req, res) => {
  res.end('validation errors, ' + JSON.stringify(errors));
});

app.get(
  '/',
  (req, res, next) => {
    next(new Error('Test error'));
  },
  (req, res) => {
    res.end('hello world');
  }
);
app.get('/bar', (req, res) => {
  throw new Error('Something was wrong in GET /bar');
  // eslint-disable-next-line no-unreachable
  res.send({ status: 'success' });
});

app.listen(4000);
