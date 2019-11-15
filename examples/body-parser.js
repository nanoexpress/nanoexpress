import nanoexpress from '../src/nanoexpress.js';
import bodyParser from '../src/packed/middlewares/body-parser';

const app = nanoexpress();

app.use(bodyParser({ json: true }));

app.get('/', (req, res) => res.end('ok'));

app.post('/', (req, res) => {
  return res.send({ status: 'ok', body: req.body });
});

app.listen(4002);
