# Static serve

Note: _This method makes use of streaming files and/or serving folder easier_

## [Basic](../examples/static.js) example

Note: _This example serves `/static` folder and anything inside this, even video/audio files_

```js
const nanoexpress = require('nanoexpress');
const path = require('path');

const app = nanoexpress();

app.static('/', path.resolve(__dirname, 'static'));

app.listen(4040);
```

[&laquo; Response](./response.md)

[Schema &raquo;](./schema.md)
