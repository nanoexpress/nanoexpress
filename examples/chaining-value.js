import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.use((req, res, next) => next(null, { foo: 'bar' }));
app.use(async (req, res, config, prevValue) => {
  prevValue.bar = 'baz';
  return prevValue;
});

app.get('/', (req, res, config, prevValue) => {
  res.end(`chained value? ${JSON.stringify(prevValue)}`);
});

app.listen(4000);
