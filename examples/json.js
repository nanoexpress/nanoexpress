import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', async () => ({ hello: 'world' }));
app.get('/send', (req, res) => {
  return res.send({ status: 'ok' });
});

app.listen(4000);
