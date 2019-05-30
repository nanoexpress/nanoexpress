const nanoexpress = require('../build/nanoexpress');

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
  .get('/favicon.ico', () => {})
  .get('/', (req, res) => res.end('Hello'))
  .get('/user/:id', (req, res) => {
    return res.end(`User: ${req.params.id}`);
  })
  .listen(3005);
