const nanoexpress = require('..');
const { resolve } = require('path');

const app = nanoexpress();

app
  .static('/', resolve(__dirname, 'static'))
  .get('/health', async () => ({ status: 'ok' }));

app.listen(4040);
