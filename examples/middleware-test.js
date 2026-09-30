import nanoexpress from '../src/nanoexpress.js';

function one(req, _res, next) {
  req.one = true;
  next();
}

function two(req, _res, next) {
  req.two = true;
  next();
}

nanoexpress()
  .use(one, two)
  .get('/favicon.ico', async () => {
    //
  })
  .get('/', (_req, res) => res.send('Hello'))
  .get('/user/:id', (req, res) =>
    res.end(`User: ${JSON.stringify(req.params.id)}`)
  )
  .listen(3000);
