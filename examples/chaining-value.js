const nanoexpress = require('..');

const app = nanoexpress();

app.use((req, res, next) => {
  return next(null, { foo: 'bar' });
});

app.get('/', (req, res, config, prevValue) => {
  res.end('chained value? ' + JSON.stringify(prevValue));
});

app.listen(4000);
