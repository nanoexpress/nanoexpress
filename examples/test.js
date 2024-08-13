import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.setErrorHandler(async (err, req, res) => {
  return res.send('error');
});
app.get('/test', async (req, res) => {
  await new Promise((resolve) => setTimeout(() => resolve(), 5000));

  return res.send('success');
});

app.listen(3000);
