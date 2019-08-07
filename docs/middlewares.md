# Middlewares

Note: _You can use almost any [express](https://expressjs.com) middleware without issues, if you facing with issues, let me know, we will solve issue together_

Note #2: _Middlewares is not like [express](https://expressjs.com) middlewares, defined `nanoexpress` middlewares are called if any of methods are defined for performance and resource effecienty reason_

Note #3: _[express](https://expressjs.com) like `app.use('/path', function)` not calling if route for `/path` is not defined_

## Built-in Middlewares

Built-in middlewares implemented at layer-level for performance reason and enables automacilly when needed, not always

### All of these things are already implemented in `nanoexpress`

| Alternative                                                                           | Implement level | Which libraries uses                                                   |
| ------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------- |
| [cookie](https://github.com/jshttp/cookie)                                            | Layer level     | [cookie](https://github.com/jshttp/cookie)                             |
| [body-parser](https://github.com/expressjs/body-parser)                               | Layer level     | Node.js builtin [querystring](https://nodejs.org/api/querystring.html) |
| [express-ws](https://github.com/HenningM/express-ws)                                  | Core level      | [Core](https://github.com/uNetworking/uWebSockets.js) library          |
| [express-serializer](https://github.com/MediaComem/express-serializer)                | Layer level     | [fast-json-stringify](https://github.com/fastify/fast-json-stringify)  |
| [express-ajv](https://bitbucket.org/netgenes/express-ajv)                             | Layer level     | [ajv](https://ajv.js.org)                                              |
| [express-declarative-routing](https://github.com/cheesun/express-declarative-routing) | Layer level     | My own implementation                                                  |

## In-box Middlewares

I'm excluded in-box modules from initialization for performance reason

### How-to import

```js
import { middlewares } from 'nanoexpress/packed';
// or import { passportInitialize } from 'nanoexpress/packed/middlewares';

const app = nanoexpress();
app.use(middlewares.passportInitialize()); // or app.use(passportInitialize());
```

#### Available middlewares

- `passport`

## Async middlewares

### Basic example

```js
app.use(async (req) => {
  req.appId = 'MY_APP_ID';
});
```

### Method defining

```js
function lazyEnd(end) {
  setTimeout(() => this.end(end), 0);
}
app.use(async (req, res) => {
  res.lazyEnd = lazyEnd;
});
```

## Express/Connect like middlewares

Performance tip: _This library target is out-of-the-box async support and works good, but we recommend using `sync` aka Express/Connect like method for performance reason_

### Tested Express/Connect like Middlewares

- `body-parser` (yes, if you don't want built-in)
- `express-fileupload`
- `cors` (yes, `express` `cors` middleware)
- `express-jwt`
- `express-session`
- `express-graphql`
- `passport`

### Basic example

```js
app.use((req, res, next) => {
  req.appId = 'MY_APP_ID';
  next();
});
```

### Method defining

```js
function lazyEnd(end) {
  setTimeout(() => this.end(end), 0);
}
app.use((req, res, next) => {
  res.lazyEnd = lazyEnd;
  next();
});
```

### You may look to [Passport](../examples/passport.js) example

## Error handling

Error which comes from Middleware automacilly will be handled by `nanoexpress`

[&laquo; Getting started](./get-started.md)

[WebSocket &raquo;](./websocket.md)
