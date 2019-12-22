import nanoexpress from '../src/nanoexpress.js';

import bodyParser from '../src/packed/middlewares/body-parser.js';
import fileUpload from '../src/packed/middlewares/file-upload.js';

import { resolve } from 'path';

const app = nanoexpress();

app.use(bodyParser());
app.use(fileUpload());

app.get('/', async () => 'ok');

app.post('/', (req, res) => {
  console.debug('files', req.files);
  console.debug('body', req.body);

  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400);
    return res.end('No files was provided');
  }

  for (const file of req.files) {
    file
      .mv(resolve('./examples/' + file.filename))
      .then(() => {
        res.send('File Uploaded!');
      })
      .catch((err) => {
        res.status(500);
        return res.send(err);
      });
  }
});

app.listen(4003);
