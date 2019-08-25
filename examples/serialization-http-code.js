import nanoexpress from '../src/nanoexpress.mjs';

const app = nanoexpress();

app.get(
  '/',
  {
    schema: {
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        }
      },
      query: false,
      params: false,
      response: {
        200: {
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        },
        403: {
          type: 'object',
          properties: {
            status: { type: 'string' }
          }
        }
      }
    }
  },
  (req, res) => {
    if (req.headers.authorization) {
      return res.json({ hello: 'world' });
    }
    res.status(403);
    return res.json({ status: 'error', message: 'Unauthorized' });
  }
);

app.listen(4000);
