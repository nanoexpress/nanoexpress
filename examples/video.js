import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', async () => 'see /video.mp4 route');
app.get('/video.mp4', (req, res) => {
  return res.sendFile(__dirname + '/video.mp4');
});

app.listen(4001);
