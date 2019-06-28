# Response

Performance tip: _If you want to your app be faster, please consider using [schemas](./schema.md)_

Performance tip #2: _If you not using these methods, especially `body`, your app will response faster, because these properties takes time parse_

## Methods

### `uWebSockets.js` methods

- `end`
- `write`
- `onAborted`
- `onWrite`
- `onData`
- `writeHeader`
- `writeStatus`

### Library-added methods

- `send`
- `json` (same as `send`, but for compatibility we keep this method)
- `sendFile`
- `redirect`
- `status`
- `writeHead`
- `cookie`
- `setCookie`
- `hasCookie`
- `removeCookie`
- `setHeader`
- `getHeader`
- `hasHeader`
- `removeHeader`
- `setHeaders`
- `writeHeaderValues`
- `writeHeaders`

## Cookie + JSON example

```js
app.get('/is_logged', (req, res) => {
  const status = res.hasCookie('userId') ? 'success' : 'error';

  res.json({ status });
});
```

## Redirect + Params example

```js
app.get('/user/:id/login', (req, res) => {
  const { id } = req.params;

  const result = await db.getUser(id);

  res.redirect(`/user/${id}/`);
});
```

## Cookie set + Body example

```js
app.post('/auth', async (req, res) => {
  const { userId } = req.body;

  res.setCookie('userId', userId);

  // do something...
});
```

[&laquo; Request](./request.md)

[Schema &raquo;](./schema.md)
