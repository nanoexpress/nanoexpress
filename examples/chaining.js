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
  .get('/favicon.ico', () => {})
  .get('/', (req, res) => res.end('Hello'))
  .get('/user/:id', (req, res) => {
    return res.end(`User: ${req.params.id}`);
  })
  .ws('/', (req, ws) => {
    ws.send('connected ;)');

    ws.on('message', (data) => {
      if (data === 'ping') {
        ws.send('pong');
      }
    });
  })
  .listen(3005);
