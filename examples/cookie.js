import nanoexpress from '../src/nanoexpress.mjs';

const app = nanoexpress();

app.get('/', async (req, res) => {
  res.setCookie('cookie', 'set', { httpOnly: true });
  return { msg: 'cookie was set' };
});
app.get('/unset', async (req, res) => {
  res.removeCookie('cookie');
  return { msg: 'cookie was unset' };
});

app.listen(4004);
