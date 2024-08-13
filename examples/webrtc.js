import { resolve } from 'path';
// eslint-disable-next-line import-x/no-unresolved, n/no-missing-import
import staticMiddleware from '@nanoexpress/middlewares/static';
import nanoexpress from '../src/nanoexpress.js';
import { webRTCServer } from '../src/packed/defines/index.js';

const app = nanoexpress();

app
  .use(staticMiddleware(resolve('examples/webrtc')))
  .define(webRTCServer)
  .webrtc('/webrtc')
  .get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(4044);
