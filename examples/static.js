import nanoexpress from '../src/nanoexpress.js';
const staticMiddleware = require('../build/static');
const { join } = require('path');

const app = nanoexpress();

app
  .use(staticMiddleware(join(__dirname + '/static')))
  .get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(4040);
