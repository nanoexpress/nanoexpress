import nanoexpress from '../src/nanoexpress.js';
import bodyParser from '../src/packed/middlewares/body-parser.js';

const app = nanoexpress();

app.use(bodyParser({ json: true, experimentalJsonParse: true }));

app.get('/', (req, res) => res.end('ok'));

app.post(
  '/',
  {
    schema: {
      body: {
        type: 'object',
        properties: {
          foo: { type: 'string' }
        }
      }
    }
  },
  (req, res) => {
    return res.send({ status: 'ok', body: req.body });
  }
);

app.listen(4002);
