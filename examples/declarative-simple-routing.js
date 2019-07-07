const nanoexpress = require('..');

const app = nanoexpress();

app.define({
  '/': {
    get: async () => ({ status: 'success' }),
    '/test': {
      get: async () => ({ test: 'ok' })
    }
  }
});

app.listen(4000);
