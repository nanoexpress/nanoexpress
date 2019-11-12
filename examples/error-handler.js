const nanoexpress = require('..');

const app = nanoexpress();

app.setErrorHandler((err, req, res) => {
  res.end(err.message);
});

app.setNotFoundHandler((req, res) => {
  res.end('you accessing to missing route??');
});

app.setValidationErrorHandler((errors, req, res) => {
  res.end('validation errors, ' + JSON.stringify(errors));
});

app.use((req, res, next) => {
  next(new Error('error happened?'));
});

app.get('/', (req, res) => {
  res.end('hello world');
});

app.listen(4000);
