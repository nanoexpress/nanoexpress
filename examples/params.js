import nanoexpress from '../src/nanoexpress.js';

nanoexpress()
  .get('/', async () => 'ok')
  .get('/user/:id', async (req) => {
    return { status: 'ok', user: req.params };
  })
  .listen(4003);
