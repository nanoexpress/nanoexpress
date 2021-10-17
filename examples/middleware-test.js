import nanoexpress from '../src/nanoexpress.js';

function one(req, res, next) {
  req.one = true;
  next();
}

function two(req, res, next) {
  req.two = true;
  next();
}

nanoexpress()
  .use(one, two)
  .get('/favicon.ico', async () => {
    //
  }) // eslint-disable-line no-unused-vars
  .get('/', (req, res) => res.send('Hello'))
  .get('/user/:id', (req, res) =>
    res.end(`User: ${JSON.stringify(req.params.id)}`)
  )
  .listen(3000);
