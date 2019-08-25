import nanoexpress from '../index.mjs';

const app = nanoexpress();

app.get(
  '/',
  {
    schema: {
      headers: {
        type: 'object',
        // required: ['origin'], // Uncomment this line
        properties: {
          origin: { type: 'string' }
        }
      }
    }
  },
  async () => '{"hello":"world"}'
);

app.listen(4000);
