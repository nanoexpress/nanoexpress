import nanoexpress from '../index.mjs';

const app = nanoexpress();

app.use((req, res, next) => {
  return next(null, { foo: 'bar' });
});
app.use(async (req, res, config, prevValue) => {
  prevValue.bar = 'baz';
  return prevValue;
});

app.get('/', (req, res, config, prevValue) => {
  res.end('chained value? ' + JSON.stringify(prevValue));
});

app.listen(4000);
