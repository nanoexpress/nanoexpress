const nanoexpress = require('..');
const cors = require('../node_modules/cors');

const app = nanoexpress();

var whitelist = ['http://localhost:5000'];
const corsConfigured = cors({
  origin(origin, callback) {
    if (origin && whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
});

app.use(corsConfigured);

app.get('/', async () => ({ hello: 'world' }));
app.post('/cors', async () => {
  return { cors: 'post' };
});
app.put('/cors', async () => {
  return { cors: 'put' };
});

app.listen(1234);
