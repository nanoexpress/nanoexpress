// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import nanoexpress from '../src/nanoexpress.js';
import { setTimeout } from 'node:timers/promises';

const app = nanoexpress();

app.get('/', async () => 'Connect at /ws');
app.ws('/ws', async (req, res) => {
  console.log('Connecting...');

  await setTimeout(1000);

  res.on('connection', (ws) => {
    console.log('Connected');

    ws.on('message', (msg) => {
      console.log('Message received', msg);
      ws.send(msg);
    });
    ws.on('close', (code, message) => {
      console.log('Connection closed', { code, message });
    });
  });
  res.on('upgrade', () => {
    console.log('Connection upgrade');
  });
});

app.listen(4000);
