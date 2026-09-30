import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', (_req, res) => {
  res.status(404);
  res.send({ code: 404, hello: 'world' });
});

app.get('/500', (_req, res) => {
  res.status(500);
  res.end('500');
});

app.listen(4000);
