import nanoexpress from '../src/nanoexpress.js';
import staticMiddleware from '../src/static';

import { webRTC } from '../src/packed/defines';

import { resolve } from 'path';

const app = nanoexpress();

app
  .use(staticMiddleware(resolve('examples/webrtc')))
  .define(webRTC)
  .webrtc('/webrtc')
  .get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(4044);
