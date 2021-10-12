// eslint-disable-next-line node/no-unpublished-import
import nanoexpress from '../../src/nanoexpress.js';
import * as swagger from './swagger.js';

const app = nanoexpress();

app.setErrorHandler((error, req, res) =>
  res.send({ error: error.stack_trace })
);

app.get('/', async () => ({ status: 'ok' }));

/*
 * Middlewares
 */
// Documentation middleware
app.use('/api-docs/', ...swagger.serve);
app.use('/api-docs/', swagger.documentation);

app.listen(5000);
