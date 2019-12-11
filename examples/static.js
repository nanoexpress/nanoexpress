import nanoexpress from '../src/nanoexpress.js';
import staticMiddleware from '../src/static.js';

import { resolve } from 'path';

const app = nanoexpress();

app
  .use(staticMiddleware(resolve('./examples/static')))
  .get('/health', (req, res) => res.send({ status: 'ok' }));

app.listen(4040);
