import nanoexpress from '../src/nanoexpress.js';
import { proxy } from '../src/packed/defines/index.js';

import ws from 'ws';

const app = nanoexpress();

app
  .define(proxy)
  .proxy(
    '/proxy',
    {
      url: 'http://localhost:3005',
      method: 'GET'
    },
    ws // If you want proxy WebSocket too
  )
  .get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(4044);
