const nanoexpress = require('..');

const app = nanoexpress();

app.get('/', async () => ({ hello: 'world' }));

app.listen(4000);
