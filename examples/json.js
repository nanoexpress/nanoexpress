import nanoexpress from '../src/nanoexpress.js';
import bodyParser from '../src/packed/middlewares/body-parser.js';

import { Writable } from 'stream';

const app = nanoexpress();

app.use(bodyParser());

app.get('/', async () => ({ hello: 'world' }));

app.post('/', (req, res) => {
  const stream = new Writable({
    write(chunk, encoding, next) {
      console.log('stream req piped', chunk.toString());
      next();
    }
  });
  req.pipe(stream);

  res.json(req.body);
});

app.listen(4000);
