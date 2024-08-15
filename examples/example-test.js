import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();
app.any('/*', (_, res) => {
  // console.log("got request")
  res.end(Buffer.from(res.getRemoteAddress()).join('.'));
});
app.listen(3000, '127.0.0.1');
