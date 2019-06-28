# Middlewares

Note: _You can use almost any [express](https://expressjs.com) middleware without issues, if you facing with issues, let me know, we will solve issue together_

## Built-in Middlewares

Built-in middlewares implemented at layer-level for performance reason and enables automacilly when needed, not always

- `cookie`
- `body-parser`
- `express-ws` (for comparing, uWS has built-in support at core-level)
- `fast-json-stringify` (for validation)
- `express-ajv` (for comparing, i did it at layer-level)
- `express-declarative-routing` (for comparing, i did it at layer-level)

## In-box Middlewares

I'm excluded in-box modules from initialization for performance reason

### How-to import

```js
import { middlewares } from 'nanoexpress/packed';
// or import { passportInitialize } from 'nanoexpress/packed/middlewares';

const app = nanoexpress();
app.use(middlewares.passportInitialize()); // or app.use(passportInitialize());
```

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

[Routes &raquo;](./routes.md)
