import { resolve } from 'path';
import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', async () => 'see /video.mp4 route');
app.get('/video.mp4', (req, res) => {
  const videoFile = resolve(`./examples/${req.path}`);
  return res.sendFile(videoFile);
});

app.listen(4001);
