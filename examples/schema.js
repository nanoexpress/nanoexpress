const nanoexpress = require('..');

const app = nanoexpress();

app.get(
  '/',
  {
    schema: {
      headers: false,
      query: false,
      params: false,
      response: {
        type: 'object',
        properties: {
          hello: { type: 'string' }
        }
      }
    }
  },
  async () => ({ hello: 'world' })
);

app.listen(4000);
