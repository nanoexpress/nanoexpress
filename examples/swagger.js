const nanoexpress = require('..');
const Route = require('../build/Route');
const reDoc = require('../src/packed/middlewares/redoc');

const app = nanoexpress({
  swagger: {
    openapi: '3.0.0',
    info: {
      title: 'nanoexpress-swagger-example',
      version: '1.0.0',
      description: 'An Swagger example'
    },
    host: 'localhost:4000',
    basePath: '/'
  }
});

app.get(
  '/',
  {
    summary: 'Hello world',
    description: 'Hello world route',
    contentType: 'application/json',
    schema: {
      headers: false,
      query: {
        description: 'Hello world query',
        type: 'object',
        properties: {
          query1: { description: 'Query1', type: 'string' }
        }
      },
      params: {
        description: 'Hello world parameters',
        type: 'object',
        properties: {
          param1: { description: 'Param1', type: 'string' }
        }
      },
      body: {
        description: 'Hello world body',
        type: 'object',
        properties: {
          body1: { type: 'string' }
        }
      },
      response: {
        description: 'Hello world response',
        type: 'object',
        properties: {
          hello: { type: 'string' }
        }
      }
    }
  },
  async () => ({ hello: 'world' })
);

const barRoute = new Route();
app.use('/foo', barRoute);

barRoute.get(
  '/bar',
  {
    schema: {
      response: {
        type: 'object',
        properties: {
          foo: { type: 'string' }
        }
      }
    }
  },
  (req, res) => res.send({ foo: 'bar' })
);

app.use(reDoc());

app.listen(4040);
