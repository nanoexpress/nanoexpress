import nanoexpress from '../src/nanoexpress.mjs';
const Route = require('../build/Route');

const app = nanoexpress();
const route = new Route();

app.use('/foo', route);
app.get('/', (req, res) => {
  res.end('go to /foo');
});

route.get('/', (req, res) => {
  res.end('/foo');
});
route.get('/bar', (req, res) => {
  res.end('/foo/bar');
});

app.listen(4000);
