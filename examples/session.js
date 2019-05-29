const nanoexpress = require('../build/nanoexpress');
const expressSession = require('express-session');

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
app.get(
  '/',
  (req) =>
    new Promise((resolve) => {
      req.sessionStore.load(req.cookies['my.sid'], (err, sess) => {
        console.log({ err, sess });
        if (!sess) {
          return resolve('session not found');
        }
        req.session = sess;
        return resolve({ foo: sess.foo });
      });
    })
);

app.post(
  '/set',
  async (req) => {
    req.session.foo = 'bar';
  },
  async (req, res) => {
    res.cookie('my.sid', req.sessionID, { httpOnly: true, sameSite: true });
    return { foo: req.session.foo };
  }
);

app.listen(4000);
