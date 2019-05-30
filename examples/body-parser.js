const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get('/', () => 'ok');

app.post('/', (req) => {
  return { status: 'ok', body: req.body };
});

app.listen(4002);
