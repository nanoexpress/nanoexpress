import nanoexpress from '../index.mjs';

const app = nanoexpress();

app.get('/', async () => ({ hello: 'world' }));

app.listen(4000);
