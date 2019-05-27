const nanoexpress = require('../build/nanoexpress');
const { bodyParser } = require('../src/builtins/middlewares');

const app = nanoexpress();

app.use(bodyParser);

app.get('/', () => 'ok');

app.post('/', (req) => {
  return { status: 'ok', body: req.body };
});

app.listen(4002);
