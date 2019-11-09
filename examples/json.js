const nanoexpress = require('..');
const bodyParser = require('../src/packed/middlewares/body-parser');

const app = nanoexpress();

app.use(bodyParser());

app.get('/', async () => ({ hello: 'world' }));

app.post('/', (req, res) => res.send({ status: 'success' }));

app.listen(4000);
