import nanoexpress from '../src/nanoexpress.js';

async function one(req) {
  req.one = true;
}

async function two(req) {
  req.two = true;
}

nanoexpress()
  .use(one, two)
  .get('/favicon.ico', () => {})
  .get('/', (req, res) => res.end('Hello'))
  .get('/user/:id', (req, res) =>
    res.end(`User: ${JSON.stringify(req.params.id)}`)
  )
  .listen(3005);
