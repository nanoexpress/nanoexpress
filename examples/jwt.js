const nanoexpress = require('../build/nanoexpress');
const expressJwt = require('../node_modules/express-jwt');
const jwt = require('../node_modules/jsonwebtoken');

// Secret key
const secret = 'secret';

const app = nanoexpress();

const jwtMiddleware = expressJwt({ secret }).unless({ path: ['/', '/token'] });

// Or can be used like this
// app.use(jwtMiddleware);

app.get('/', async () => ({ protected: false }));
app.post('/token', async () => {
  const token = await jwt.sign({ protected: true }, secret);

  return { token };
});
app.post('/protected', jwtMiddleware, async () => ({ protected: true }));

app.listen(4000);
