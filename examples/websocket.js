// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', async () => 'Connect at /ws');
app.ws('/ws', async (req, res) => {
  console.log('Connecting...');

  await new Promise((resolve) => setTimeout(resolve, 1000));

  res.on('connection', (ws) => {
    console.log('Connected');

    ws.on('message', (msg) => {
      // eslint-disable-next-line security-node/detect-crlf
      console.log('Message received', msg);
      ws.send(msg);
    });
    ws.on('close', (code, message) => {
      // eslint-disable-next-line security-node/detect-crlf
      console.log('Connection closed', { code, message });
    });
  });
  res.on('upgrade', () => {
    console.log('Connection upgrade');
  });
});

app.listen(4000);
