const nanoexpress = require('..');
const bodyParser = require('../src/packed/middlewares/body-parser');

const app = nanoexpress();

app.use(bodyParser({ json: true }));

app.get('/', async () => 'ok');

app.post('/', async (req) => {
  return { status: 'ok', body: req.body };
});

app.listen(4002);
