const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get('/', async (req, res) => {
  res.setCookie('cookie', 'set', { httpOnly: true });
  return { hello: 'world' };
});
app.get('/unset', async (req, res) => {
  res.removeCookie('cookie');
  return { hello: 'world' };
});

app.listen(4004);
