import nanoexpress from '../src/nanoexpress.js';

import swaggerUi from '../src/packed/middlewares/swagger-ui.js';

const app = nanoexpress({
  swagger: {
    openapi: '3.0.0',
    info: {
      title: 'nanoexpress-swagger-example',
      version: '1.0.0',
      description: 'An Swagger example'
    },
    host: 'localhost:4000',
    basePath: '/',
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          description: 'Auth token',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
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

app.use(swaggerUi());

app.listen(4040);
