import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', (req, res) => {
  res.status(404);
  res.send({ code: 404, hello: 'world' });
});

app.get('/500', (req, res) => {
  res.status(500);
  res.end('500');
});

app.listen(4000);
