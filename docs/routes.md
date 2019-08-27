# Routes

Routes are intellectual, not only good, because if your routes are simple, library uses direct calling to `uWebSockets.js` which improves response time by 30-40% and responses performance will be almost equal to `uWebSockets.js.

Performance tip: _Using many middlewares may slow response performance_

## Route-middleware route

Yes, finally, we have working model of Express-middleware like routes

```js
import Route from 'nanoexpress/src/Route';

const route = new Router();

// To working properly, first apply `app.use(route)`
// and then set `route.get(...)`, else this not works
// properly yet
app.use(route);

route.get('/', async () => 'hello world');
```

## Async route

### Basic Async example

```js
app.get('/', async () => ({ status: 'success' }));
```

### Just example

```js
app.get('/', async (req, res) => {
  const result = await db.getUser(req.params.id);

  return result;
});
```

## Express/Connect like route

This library target is out-of-the-box async support and works good, but we recommend using `sync` aka Express/Connect like method for performance reason.

### Basic example

```js
app.get('/', (req, res) => {
  res.end('hello world');
});
```

### JSON example

```js
app.post('/', (req, res) => {
  const { body } = req;

  res.json({ status: 'ok' });
});
```

## Raw example

Note: _Body-parsing, schema validating are unavailable here, but RPS are higher by 5-10%_

```js
app.get('/', { isRaw: true }, (req, res) => {
  // do something...
});
```

## noMiddleware example

Note: _All middlewares including globals will be disabled for this route_

```js
app.get('/', { noMiddleware: true }, (req, res) => {
  // do something...
});
```

## onAborted example

```js
app.get(
  '/',
  {
    onAborted: () => {
      /* cancel your async task somehow */
    }
  },
  (req, res) => {
    // do something...
  }
);
```

## Error handling example

```js
app.setErrorHandler((err, req, res) => {
  if (checkSomething(err)) {
    res.send(sendSomething());
  }
});
```

Also available these methods

- `app.setErrorHandler(error: Error, req: HttpRequest, res: HttpResponse): HttpResponse`
- `app.setValidationErrorHandler(errors: ValidationErrors[], req: HttpRequest, res: HttpResponse): HttpResponse`
- `app.setNotFoundHandler(req: HttpRequest, res: HttpResponse): HttpResponse`

## Known Issues

Ooops, there no known issues yet

[&laquo; Websocket](./websocket.md)

[Request &raquo;](./request.md)
