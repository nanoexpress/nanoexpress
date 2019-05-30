const nanoexpress = require('../build/nanoexpress');
const expressSession = require('../node_modules/express-session');

const app = nanoexpress();

app.use(
  expressSession({
    name: 'my.sid',
    secret: 'session_secret',
    rolling: true,
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: false,
      secure: false,
      maxAge: 6 * 30 * 24 * 60 * 60 * 1000,
      httpOnly: true
    },
    logErrors: true
  })
);

// Our routes list
app.get('/', (req) => {
  return { foo: req.session.foo || 'undefined' };
});

app.post('/set', async (req) => {
  req.session.foo = 'bar';
  return { foo: req.session.foo };
});

app.listen(4000);
