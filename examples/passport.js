import nanoexpress from '../src/nanoexpress.js';
const { passportInitialize } = require('../src/packed/middlewares');
const expressSession = require('../node_modules/express-session');
const passport = require('../node_modules/passport');
const LocalStrategy = require('../node_modules/passport-local').Strategy;

const app = nanoexpress();

app.use(
  expressSession({
    name: 'passport.sid',
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

// Init passport.js
// Use `passportInitialize()` insteadof `passport.initialize()`
app.use(passportInitialize());
app.use(passport.session());

// Create Strategy
const strategy = new LocalStrategy(
  {
    passReqToCallback: true,
    usernameField: 'username',
    passwordField: 'password'
  },
  function (req, username, password, done) {
    if (password !== '12345678') {
      return done(null, false);
    }
    return done(null, { id: 'id_' + username, username, password });
  }
);

// Configuration
passport.use(strategy);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Our routes list
app.get('/', async (req) => {
  return { user: req.user || 'Unauthorized' };
});

app.get('/done', (req, res) => {
  res.end('Auth success');
});

app.get('/error', (req, res) => {
  res.end('Auth failed');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/done',
    failureRedirect: '/error'
  })
);

app.listen(4000);
