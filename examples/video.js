const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get('/', () => 'see /video.mp4 route');
app.get('/video.mp4', (req, res) => {
  return res.sendFile(__dirname + '/video.mp4');
});

app.listen(4001);
