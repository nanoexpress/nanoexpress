const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get(
  '/',
  {
    schema: {
      headers: {
        type: 'object',
        properties: {
          origin: { type: 'string' }
        }
      }
    }
  },
  () => '{"hello":"world"}'
);

app.listen(4000);
