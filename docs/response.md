# Response

Performance tip: _If you want to your app be faster, please consider using [schemas](./schema.md) for serilization which improves RPS by 3-5%_

Stability tip: _If you don't want crash of your application, please try always check return values and do not allow like this values `{foo: undefined}` as this crashes, this issue refers to uWebSockets.js_

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
- `type`
- `header`

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

## sendFile (aka Stream)

Note: _File should on same directory of this request._

_Or you can try `Absolute URLs` for stream_

```js
app.get('/video.mp4', (req, res) => {
  res.sendFile('video.mp4');
});
```

[&laquo; Request](./request.md)

[Static Serve &raquo;](./static-serve.md)
