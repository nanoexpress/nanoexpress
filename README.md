# nanoexpress

[![Greenkeeper badge](https://badges.greenkeeper.io/dalisoft/nanoexpress.svg)](https://greenkeeper.io/)

Nano-framework for Node.js powered by uWebSockets.js

## NOTE

This application isn't production ready and use at your own risk

Very strange, when using this module, performance is slower by ~30% than uWebSockets.js while i'm expected maximum 10-20% performance loss. I'll already looking to fix this!

## Motiviation

I've long-time planned somehow create own Express-like alternative Node.js framework, then seen uWebSockets.js. Almost 2 month i've think how do this right and decided to create Node.js framework with almost same as Express API.

This library makes very thin layer between uWebSockets.js and your code. But, gives you very Familiar and Clean API. Async/Await supported out-of-the-box!

## Features

- Async/Await out-of-the-box
- Easy to use (for Express users especially)
- Blazing fast performance
- Ultra lightweight size
- Resource (CPU / Memory) effecient
- Familiar API
- Normalised API
- Can define routes Declaratively
- Express-compatible middleware
- In-built `body-parser` middleware (JSON, FormEncoded, Plain, XML)
- In-built `cookie` middleware
- In-built Stream (Video stream, yay!) support
- In-built WebSocket support (Express-like API and Events)
- Out-of-the-box `fast-json-stringify` support via `{schema}` middleware

## Built-in Middlewares

I'm excluded built-ins modules from initialization for performance reason

### How-to import

```js
import { middlewares } from 'nanoexpress/builtins';
// or import { bodyParser, cookie } from 'nanoexpress/builtins/middlewares';

const app = nanoexpress();
app.use(middlewares.bodyParser); // or app.use(bodyParser);
```

- `body-parser`
- `cookie`

## Working Middlewares

- `express-fileupload`

## Credits

- [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js)
- [Siffr Server](https://github.com/sifrr/sifrr/tree/master/packages/server/sifrr-server)
- [fast-json-stringify](https://github.com/fastify/fast-json-stringify)
- [fast-json-stable-stringify](https://github.com/epoberezkin/fast-json-stable-stringify)
- [cookie](https://github.com/jshttp/cookie#readme)

And to other libraries which used to create this library and without these libraries wouldn't be possible to create this library

## License

Apache-2.0
