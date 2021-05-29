import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.any('/*', (req, res) => {
  res.end(`ip address is ${req.getIP()}`);
});

app.listen('127.0.0.1', 4000);
