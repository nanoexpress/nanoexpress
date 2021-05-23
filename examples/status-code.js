import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(401);
  res.end(JSON.stringify({ status: 'unknown' }));
});

app.listen(4000);
