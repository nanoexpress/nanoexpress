const nanoexpress = require('..');

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
  .get('/favicon.ico', async (req) => {}) // eslint-disable-line no-unused-vars
  .get('/', (req, res) => res.send('Hello'))
  .get('/user/:id', (req, res) => {
    res.end(`User: ${req.params.id}`);
  })
  .listen(3000);
