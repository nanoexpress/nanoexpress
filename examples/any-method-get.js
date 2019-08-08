const nanoexpress = require('..');

const app = nanoexpress();

app.any('/', (req, res) => {
  res.end('called method ' + req.method);
});

app.listen(4000);
