const nanoexpress = require('../build/nanoexpress');
const { resolve } = require('path');

const app = nanoexpress();

app.static('/', resolve(__dirname, 'static'));

app.listen(4040);
