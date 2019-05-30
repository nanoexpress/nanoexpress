const nanoexpress = require('../build/nanoexpress');
const fileUpload = require('../node_modules/express-fileupload');

const app = nanoexpress();

app.use(fileUpload({ useTempFiles: true }));

app.get('/', () => 'ok');

app.post('/', (req, res) => {
  console.log('files', req.files);
  console.log('body', req.body);

  req.files.file.mv(__dirname + '/uploads/file.jpg', function(err) {
    if (err) {
      res.status(500);
      res.send(err);
      return undefined;
    }

    res.send('File uploaded!');
  });
});

app.listen(4003);
