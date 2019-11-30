import nanoexpress from '../src/nanoexpress.js';
import bodyParser from '../src/packed/middlewares/body-parser.js';

const app = nanoexpress();
app.use(bodyParser());

app.get('/', async () => ({ hello: 'world' }));

app.post('/', (req, res) => {
  console.log([req.body]);

  res.end('got body');
});

app.listen(4000);
