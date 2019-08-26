import nanoexpress from '../src/nanoexpress.mjs';

nanoexpress()
  .get('/', async () => 'ok')
  .get('/user/:id', async (req) => {
    return { status: 'ok', user: req.params };
  })
  .listen(4003);
