// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-unresolved, node/no-missing-import */
import expressSession from 'express-session';
import nanoexpress from '../src/nanoexpress.js';

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
app.get('/', async (req) => ({ foo: req.session.foo || 'undefined' }));

// Type below line into browser console
/*
await fetch('http://localhost:4000/set', { method: 'POST', body: JSON.stringify({username:'user', password: 'password'}), headers: { 'Content-Type': 'application/json' }, credentials: 'include' }).then(res => res.json())
*/

app.post('/set', async (req) => {
  req.session.foo = 'bar';
  return { foo: req.session.foo };
});

app.listen(4000);
