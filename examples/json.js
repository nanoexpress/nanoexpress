import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', async () => ({ hello: 'world' }));

app.listen(4000);
