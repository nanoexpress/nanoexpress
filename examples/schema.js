import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress({ swagger: {} });

app.get(
  '/',
  {
    schema: {
      headers: false,
      query: {
        type: 'object',
        properties: {
          url: {
            type: 'string'
          }
        },
        required: ['url']
      },
      cookies: false,
      params: false,
      response: {
        type: 'object',
        properties: {
          hello: { type: 'string' },
          url: {
            type: 'string'
          }
        }
      }
    }
  },
  async (req) => ({ hello: 'world', url: req.query.url })
);

app.listen(4000);
