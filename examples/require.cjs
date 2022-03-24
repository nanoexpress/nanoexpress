// eslint-disable-next-line import/extensions
const nanoexpress = require('../cjs');

const app = nanoexpress();

app.get('/', (req, res) => {
  res.end('hello world');
});
app.get('/got', async () => 'hello world');

app.listen(4000);
