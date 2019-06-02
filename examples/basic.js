const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get('/', async (req, res) => {
  res.end('hello world');
});

app.listen(4000);
