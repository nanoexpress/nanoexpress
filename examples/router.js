import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();
app
  .get('/', (_, response) => {
    response.end('');
  })
  .get('/user/:id', (request, response) => response.end(request.params.id))
  .post('/user', (request, response) => {
    response.end('');
  })
  .get('/test/simple/:id', async (request) => ({
    id: request.params.id
  }));

app.listen(4000);
