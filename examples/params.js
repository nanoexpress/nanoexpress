import nanoexpress from '../src/nanoexpress.mjs';

nanoexpress()
  .get('/', () => 'ok')
  .get('/user/:id', (req) => {
    return { status: 'ok', user: req.params };
  })
  .listen(4003);
