const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get(
  '/',
  {
    schema: {
      response: {
        type: 'object',
        properties: {
          hello: { type: 'string' }
        }
      }
    }
  },
  () => ({ hello: 'world' })
);

app.listen(4000);
