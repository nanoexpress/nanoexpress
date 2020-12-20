import nanoexpress from '../src/nanoexpress.js';

nanoexpress()
  .get()
  .get('/', async () => 'ok')
  .get('/user/:id', (req, res) => res.send({ status: 'ok', user: req.params }))
  .listen(4003);
