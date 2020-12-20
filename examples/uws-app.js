import uWS from 'uWebSockets.js';

const app = uWS.App();

app.get('/', (res) => {
  res.end('hello world');
});

app.get('/foo/', (res) => {
  res.end('hello at /foo/');
});

app.get('/bar', (res) => {
  res.end('hello at /bar');
});

app.listen(
  4005,
  // eslint-disable-next-line no-console
  (token) => token && console.debug('server started at port', 4005)
);
