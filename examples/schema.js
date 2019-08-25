import nanoexpress from '../index.mjs';

const app = nanoexpress();

app.get(
  '/',
  {
    schema: {
      headers: false,
      query: false,
      cookies: false,
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
