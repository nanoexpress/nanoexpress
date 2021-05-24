import nanoexpress from '../src/nanoexpress.js';

nanoexpress()
  .get('/', async () => 'ok')
  .get('/user/:id', (req, res) => res.send({ status: 'ok', user: req.params }))
  .get('/*', (req, res) => res.send({ path: req.path }))
  .listen(4003);
