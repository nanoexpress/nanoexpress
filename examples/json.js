import nanoexpress from '../src/nanoexpress.mjs';

const app = nanoexpress();

app.get('/', async () => ({ hello: 'world' }));

app.listen(4000);
