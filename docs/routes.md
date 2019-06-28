# Routes

Routes are intellectual, not only good, because if your routes are simple, library uses direct calling to `uWebSockets.js` which improves response time by 30-40% and responses performance will be almost equal to `uWebSockets.js.

Performance tip: _Using many middlewares may slow response performance_

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

Note: _Any polyfilled methods unavailable here, But performance may shock you!_

```js
app.get('/', { isRaw: true }, (res, req) => {
  // do something...
});
```

## Prefix example

Note: _This option will be helpful when you want single config object to many routes_

```js
app.get('/', { isPrefix: '/v1' }, (res, req) => {
  // req.path === '/v1/'
});
```

## [Declarative](../examples/declarative-routing.js) example

```js
app.define({
  '/': {
    put: {
      schema: {
        response: {
          type: 'object',
          properties: {
            route: { type: 'string' }
          }
        }
      },
      middlewares: [(req, res, next) => next()]
      callback: () => ({ route: 'put /' })
    },
    get: () => ({ route: 'get /' }),
    '/sub1': {
      get: () => ({ route: 'get /sub1/' })
    }
  },
  '/ext-sub': {
    get: () => ({ route: 'direct get /ext-sub/' })
  }
});
```

[&laquo; Middlewares](./middlewares.md)

[Request &raquo;](./request.md)
