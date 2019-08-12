# Routes

Routes are intellectual, not only good, because if your routes are simple, library uses direct calling to `uWebSockets.js` which improves response time by 30-40% and responses performance will be almost equal to `uWebSockets.js.

Performance tip: \_Using many middlewares may slow response

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
app.get('/', { isRaw: true }, (req, res) => {
  // do something...
});
```

## Direct example

Note: _Any polyfilled methods unavailable here, But performance may shock you!_

```js
app.get('/', { isRaw: true, direct: true }, (res, req) => {
  // do something...
});
```

## Prefix example

Note: _This option will be helpful when you want single config object to many routes_

```js
app.get('/', { isPrefix: '/v1' }, (req, res) => {
  // req.path === '/v1/'
});
```

## [Declarative](../examples/declarative-routing.js) example

### **Warning**: The `declarative` routing will be deprecated starting at `v1 / Stable` release due of a lot of issues, please don't use this starting at current time (at time of you see)

**Note**: _If you see error like this `Route - route function was not defined`, please try chaing your `get: (req, res) => {}` to `get: { callback: (req, res) => {} }`. This happens because there has some sort of bug, but not critical, doesn't affects to performance. PR are welcome_

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

## Known Issues

- See [my comment on #28](https://github.com/dalisoft/nanoexpress/issues/28#issuecomment-520485552)

[&laquo; Websocket](./websocket.md)

[Request &raquo;](./request.md)
