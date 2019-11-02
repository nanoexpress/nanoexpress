const nanoexpress = require('..');

const app = nanoexpress();

app.get('/', (req, res) => {
  res.end('ip address is ' + req.getIP());
});

app.listen('127.0.0.1', 4000);
