import nanoexpress from '../src/nanoexpress.js';
import { resolve } from 'path';

import { resolve } from 'path';

const videoFile = resolve('./examples/video.mp4');

const app = nanoexpress();

app.get('/', async () => 'see /video.mp4 route');
app.get('/video.mp4', (req, res) => {
  const videoFile = resolve(`./examples/${req.path}`);
  return res.sendFile(videoFile);
});

app.listen(4001);
