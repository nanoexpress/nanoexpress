const nanoexpress = require('..');

const app = nanoexpress();

app.get('/', (req, res) => {
  res.end('{"hello":"world"}');
});
app.get('/b', (req, res) => {
  res.end('route /b');
});
app.any((req, res) => {
  res.end('Not Found');
});

app.listen(4000);
