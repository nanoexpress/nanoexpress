// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import cors from 'cors';
import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

const corsConfigured = cors({
  origin: 'http://localhost:5000',
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
});

app.use(corsConfigured);

app.get('/', async () => ({ hello: 'world' }));
app.post('/cors', async () => ({ cors: 'post' }));
app.put('/cors', async () => ({ cors: 'put' }));

app.listen(1234);
