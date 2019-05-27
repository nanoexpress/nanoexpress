const uWS = require('../node_modules/uWebSockets.js');

const app = uWS.App();

app.get('/', async (res) => {
  res.writeHeader('Content-Type', 'application/json');
  res.end('{"hello":"world"}');
});

app.listen(
  4005,
  (token) => token && console.log('server started at port', 4005)
);
