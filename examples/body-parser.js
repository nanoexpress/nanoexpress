const nanoexpress = require('..');

const app = nanoexpress();

app.get('/', async () => 'ok');

app.post('/', async (req) => {
  return { status: 'ok', body: req.body };
});

app.listen(4002);
