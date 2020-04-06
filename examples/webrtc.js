import nanoexpress from '../src/nanoexpress.js';
import staticMiddleware from '@nanoexpress/middlewares/static';

import { webRTCServer } from '../src/packed/defines';

import { resolve } from 'path';

const app = nanoexpress();

app
  .use(staticMiddleware(resolve('examples/webrtc')))
  .define(webRTCServer)
  .webrtc('/webrtc')
  .get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(4044);
