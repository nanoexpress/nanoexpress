const nanoexpress = require('..');

const { webRTC } = require('../src/packed/defines');
const staticMiddleware = require('../build/static');

const { join } = require('path');

const app = nanoexpress();

app
  .use(staticMiddleware(join(__dirname + '/webrtc')))
  .define(webRTC)
  .webrtc('/webrtc')
  .get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(4044);
