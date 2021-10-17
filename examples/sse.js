// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import sse from 'sse-broadcast';
import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress({ swagger: {} });
const sseApp = sse();

app.use(async (req, res) => {
  res.socket = {
    setNoDelay: () => {
      //
    }
  };
  const _oldWrite = res.write;
  res.write = function resWrite(data, charset, callback) {
    _oldWrite.call(this, data, charset);
    callback();
  };
});
app.get('/events', (req, res) => {
  sseApp.subscribe('channel', res);
});

app.post('/event/:type', { isRaw: false }, (req, res) => {
  sseApp.publish('channel', req.params.type, 'whoo! something happened!');
  res.modifyEnd();
  res.end();
});

app.listen(3333);
