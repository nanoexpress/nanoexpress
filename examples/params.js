const nanoexpress = require('../build/nanoexpress');

nanoexpress()
  .get('/', () => 'ok')
  .get('/user/:id', (req) => {
    return { status: 'ok', user: req.params };
  })
  .listen(4003);
