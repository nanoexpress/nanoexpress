const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get('/', (req, res) => {
  return res.redirect('/another');
});
app.get('/google', (req, res) => {
  return res.redirect('https://google.com/');
});
app.get('/another', async () => ({ redirected: true }));

app.listen(4000);
