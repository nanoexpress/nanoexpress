const nanoexpress = require('../build/nanoexpress');
const fileUpload = require('../node_modules/express-fileupload');

const path = require('path');

const app = nanoexpress();

app.use(fileUpload({ useTempFiles: true }));

app.get('/', () => 'ok');

app.post('/', (req, res) => {
  console.debug('files', req.files);
  console.debug('body', req.body);

  req.files.file.mv(path.join(__dirname, '/uploads/file.jpg'), function(err) {
    if (err) {
      res.status(500);
      return res.send(err);
    }

    return res.send('File uploaded!');
  });
});

app.listen(4003);
