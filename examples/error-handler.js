const nanoexpress = require('..');

const app = nanoexpress();

app.setErrorHandler((err, req, res) => {
  res.end(err.message);
});

app.use((req, res, next) => {
  next(new Error('error happened?'));
});

app.get('/', (req, res) => {
  res.end('hello world');
});

app.listen(4000);
