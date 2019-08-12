const path = require('path');
const fs = require('fs');
const nanoexpress = require('..');
const util = require('util');
const fsReadDir = util.promisify(fs.readdir);

const app = nanoexpress();
const port = 4000;

// list the files of `storage/media` directory
app.get('/', async () => {
  try {
    const files = await fsReadDir(path.resolve(__dirname, 'static'));
    return { error: false, files };
  } catch (err) {
    return { error: true };
  }
});

// start server
(async () => {
  try {
    await app.listen(port, '0.0.0.0');
  } catch (err) {
    console.error(err);
  }
})();
