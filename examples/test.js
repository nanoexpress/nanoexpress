import nanoexpress from '../src/nanoexpress.js';

/**
 * @type {import('../nanoexpress.js').default.INanoexpressApp}
 */
const app = nanoexpress();

app.setErrorHandler(async (err, req, res) => {
  return res.send('error');
});
await app.get('/test', async (req, res) => {
  await new Promise((resolve) => setTimeout(() => resolve(), 5000));

  return res.end('success');
});

app.listen(3000);
