# Request

## Properties

- `headers`
- `params`
- `query`
- `body`
- `cookies`

Performance tip: _If you want to your app be faster, please consider using [schemas](./schema.md)_

Performance tip #2: _If you not using these properties, especially `body`, your app will response faster, because these properties takes time parse_

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

Bonus: _nanoexpress handlers body-parsing for you very fast_

```js
app.post('/user', async (req) => {
  const { username, password } = req.body;

  // You can use db.createUser(req.body), but this may cause side-effects
  const result = await db.createUser({ username, password });

  // do something...
});
```

## Cookies example

```js
app.post('/user', async (req) => {
  const { userId } = req.cookies;

  // You can use db.createUser(req.body), but this may cause side-effects
  const isUserLoggedIn = await dbHelper.checkUser(userId);

  // do something...
});
```

[&laquo; Routes](./routes.md)

[Response &raquo;](./response.md)
