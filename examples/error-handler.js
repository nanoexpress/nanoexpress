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

app.use((req, res, next) => {
  next(new Error('Test error'));
});

app.get('/', (req, res) => {
  console.log('it is runs???');
  res.end('hello world');
});

app.listen(4000);
