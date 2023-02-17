// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable n/no-missing-import */
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from './swagger.json';

const specs = swaggerJsDoc({
  swaggerDefinition,
  apis: ['./src/routes/*/docs.yml']
});

const { serve } = swaggerUi;
const documentation = swaggerUi.setup(specs, {
  explorer: true
});

export { serve, documentation };
