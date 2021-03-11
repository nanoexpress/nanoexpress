// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-unresolved, node/no-missing-import */

import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import nanoexpress from '../src/nanoexpress.js';

// Secret key
const secret = 'secret';

const app = nanoexpress();

const jwtMiddleware = expressJwt({ secret }).unless({ path: ['/', '/token'] });

// Or can be used like this
// app.use(jwtMiddleware);

// Type this into browser console
/*!
await fetch('http://localhost:4000/protected', { method: 'POST', body: JSON.stringify({foo:'bar'}), headers: { 'Content-Type': 'application/json', Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm90ZWN0ZWQiOnRydWUsImlhdCI6MTU1OTEyNTA2OX0.WzksMNEZs4gdyu0wb7_Pav-mOI17t3u8ox0y-HN3Fks' } }).then(res => res.json())
*/

app.get('/', async () => ({ protected: false }));
app.post('/token', async () => {
  const token = await jwt.sign({ protected: true }, secret);

  return { token };
});
app.post('/protected', jwtMiddleware, async () => ({ protected: true }));

app.listen(4000);
