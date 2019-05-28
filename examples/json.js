const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get('/', async () => ({ hello: 'world' }));

app.listen(4000);
