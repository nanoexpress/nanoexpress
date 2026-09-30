const nanoexpress = require('../cjs');

const app = nanoexpress();

app.get('/', (_req, res) => {
  res.end('hello world');
});
app.get('/got', async () => 'hello world');

app.listen(4000);
