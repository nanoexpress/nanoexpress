import nanoexpress from '../src/nanoexpress.js';
import Route from '../src/Route.js';

const app = nanoexpress();
const route = new Route();

route.use(async (req, res) => {
  req.m = 1;
  res.m = 2;
});

app.get('/', (req, res) => {
  res.end('go to /foo');
});

route.get('/', (req, res) => {
  res.end('/foo');
});
route.get('/bar', (req, res) => {
  res.end('/foo/bar');
});
app.use('/foo', route);

app.listen(4000);
