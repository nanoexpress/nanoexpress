const nanoexpress = require('..');

const app = nanoexpress();

app.get('/', async () => 'Connect at /ws');
app.ws('/ws', (req, ws) => {
  console.log('Connected');

  ws.on('message', (msg) => {
    console.log('Message received', msg);
    ws.send(msg);
  });
  ws.on('close', (code, message) => {
    console.log('Connection closed', { code, message });
  });
});

app.listen(4000);
