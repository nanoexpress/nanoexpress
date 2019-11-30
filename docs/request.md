# Request

## Properties

- `headers`
- `params`
- `query`
- `body`
- `cookies`

## Methods

- `pipe`

Performance tip: _If you want to your app be faster, please consider using [schemas](./schema.md) for serilization which improves RPS by 3-5%_

Performance tip #2: _If you not using these properties, especially `body` and `headers`, your app response becomes faster, because these properties takes time for parse_

## Headers example

```js
app.get('/secret', (req) => {
  const { authorization } = req.headers;
});
```

## Params example

```js
app.get('/user/:id/login', async (req) => {
  const { id } = req.params;

  const result = await db.getUser(id);

  // do something...
});
```

## Query example

```js
// /user?token=123
app.get('/user', async (req) => {
  const { token } = req.query;

  const result = await jwt.verifyToken(token);

  // do something...
});
```

## Body example

Bonus: _nanoexpress handles body-parsing for you faster than any external middleware and even without external middleware_

```js
app.post('/user', async (req) => {
  const { username, password } = req.body;

  // You can use db.createUser(req.body), but this may cause side-effects
  const result = await db.createUser({ username, password });

  // do something...
});
```

## Cookies example

**Note**: _For to be working properly `cookie` parsing, please install [cookie](https://github.com/jshttp/cookie) module yourself, it's in our library in `peerDependencies`_

```js
app.post('/user', async (req) => {
  const { userId } = req.cookies;

  // You can use db.createUser(req.body), but this may cause side-effects
  const isUserLoggedIn = await dbHelper.checkUser(userId);

  // do something...
});
```

## [Upload](../examples/upload-file.js) example

Note: _This examples uses `express-fileupload` middleware as example_

```js
const fileUpload = require('express-fileupload');
const path = require('path');

app.use(fileUpload({ useTempFiles: true }));
app.post('/', (req, res) => {
  console.debug('files', req.files);
  console.debug('body', req.body);

  req.files.file.mv(path.join(__dirname, '/uploads/file.jpg'), (err) => {
    if (err) {
      res.status(500);
      return res.send(err);
    }

    return res.send('File uploaded!');
  });
});
```

[&laquo; Routes](./routes.md)

[Response &raquo;](./response.md)
