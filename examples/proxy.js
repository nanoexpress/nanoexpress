import nanoexpress from '../src/nanoexpress.js';

import { proxy } from '../src/packed/defines/index.js';

const app = nanoexpress();

app
  .define(proxy)
  .proxy('/proxy', {
    url: 'http://localhost:3005',
    method: 'GET'
  })
  .get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(4044);
