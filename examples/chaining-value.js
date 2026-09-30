import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.use((_req, _res, next) => next(null, { foo: 'bar' }));
app.use(async (_req, _res, _config, prevValue) => {
  prevValue.bar = 'baz';
  return prevValue;
});

app.get('/', (_req, res, _config, prevValue) => {
  res.end(`chained value? ${JSON.stringify(prevValue)}`);
});

app.listen(4000);
