import nanoexpress from '../index.mjs';

const app = nanoexpress();

app.get('/', (req, res) => {
  res.status(401);
  res.end('');
});

app.listen(4000);
