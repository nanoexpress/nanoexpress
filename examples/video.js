import nanoexpress from '../src/nanoexpress.js';
import { resolve } from 'path';

const app = nanoexpress();

app.get('/', async () => 'see /video.mp4 route');
app.get('/video.mp4', (req, res) => {
  return res.sendFile(resolve('./examples/video.mp4'));
});

app.listen(4001);
