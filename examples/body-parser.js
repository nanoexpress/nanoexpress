import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.use(async (req) => {
  req.body = JSON.parse(req.body);
});

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
  (req, res) => res.send({ status: 'ok', body: req.body })
);

app.listen(4002);
