import nanoexpress from '../src/nanoexpress.mjs';

const app = nanoexpress();

app.any('/', (req, res) => {
  res.end('called method ' + req.method);
});

app.listen(4000);
