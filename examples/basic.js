const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get('/', () => '{"hello":"world"}');

app.listen(4000);
