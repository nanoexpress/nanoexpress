# Static serve

Note: _This method makes use of streaming files and/or serving folder easier_

## [Basic](../examples/static.js) example

Note: _This example serves `/static` folder and anything inside this, even video/audio files_

```js
// CJS
const nanoexpress = require('nanoexpress');
const staticServe = require('nanoexpress/build/static');
const path = require('path');

// or ES6 Imports
import nanoexpress from 'nanoexpress';
import staticServe from 'nanoexpress/src/static';
import path from 'path';

const app = nanoexpress();

app.use(staticServe(path.join(__dirname, 'static')));

app.listen(4040);
```

[&laquo; Response](./response.md)

[Schema &raquo;](./schema.md)
