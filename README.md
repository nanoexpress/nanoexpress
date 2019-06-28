# nanoexpress

[![Greenkeeper badge](https://badges.greenkeeper.io/dalisoft/nanoexpress.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/dalisoft/nanoexpress.svg)](http://github.com/dalisoft/nanoexpress)
[![Code Climate](https://codeclimate.com/github/dalisoft/nanoexpress/badges/gpa.svg)](https://codeclimate.com/github/dalisoft/nanoexpress)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/dalisoft/nanoexpress/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/dalisoft/nanoexpress/?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/dalisoft/nanoexpress/badge.svg?branch=master)](https://coveralls.io/github/dalisoft/nanoexpress?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dm/nanoexpress.svg)](https://npmjs.org/package/nanoexpress)
[![NPM Version](https://img.shields.io/npm/v/nanoexpress.svg)](https://npmjs.org/package/nanoexpress)
[![size](https://img.badgesize.io/https://unpkg.com/nanoexpress)](http://unpkg.com/nanoexpress)
[![gzipsize](https://img.badgesize.io/https://unpkg.com/nanoexpress?compression=gzip)](http://unpkg.com/nanoexpress)

Nano-framework for Node.js powered by uWebSockets.js

**[NEW]**: Documentation available [here](./docs/index.md)

_If you want **Suport** me, please see [Support](#support) section_

_See [**Credits**](#credits) if you want which libraries i've used_

## NOTE

This library reached the `Alpha` status and works good, see `/examples` folder.

This library up to 25% slower than `uWebSockets.js` on normal and complex application because of method polyfilling layer. Basic usage/examples performance are same as `uWebSockets.js`, but not in all case gives you same performance.

**Requires**: Node.js v10 or greater

## Benchmarks

![Benchmarks](/.github/images/benchmark.png)
![Memory Usage](/.github/images/memory.png)

Benchmarked on my macBook Pro 2012 13" (Core i5, 8Gb RAM) performance.

**Note**: _Real-world app memory/rps may differs from these numbers and these numbers are in my macBook_

_You can install `wrk` via `Homebrew` in `macOS` or `Linux`_

**Benchmark command**: `wrk -t1 -d60 -c100`

## Motiviation

I've long-time planned somehow create own Express-like alternative Node.js framework, then seen uWebSockets.js. Almost 2 month i've think how do this right and decided to create Node.js framework with almost same as Express API.

This library makes very thin layer between uWebSockets.js and your code. But, gives you very Familiar and Clean API. Async/Await supported out-of-the-box!

## Features

- Async/Await out-of-the-box
- No async mode supported
- Easy to use (for Express users especially)
- Blazing fast performance
- Ultra lightweight size
- Resource (CPU / Memory) effecient
- Familiar API
- Normalised API
- Can define routes Declaratively
- Express-compatible middleware
- In-built middlewares
- In-built Stream (Video stream, yay!) support
- In-built WebSocket support (Express-like API and Events)
- In-built Schema validator via `Ajv`
- Out-of-the-box `fast-json-stringify` support via `{schema}` middleware
- Small working examples
- TypeScript declaration
- Tests and CI checked code

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

## Working Middlewares

- `body-parser` (yes, if you don't want built-in)
- `express-fileupload`
- `cors` (yes, `express` `cors` middleware)
- `express-jwt`
- `express-session`
- `passport`

## Docker Support

If you using `alpine` or `slim` version of `node` images, some errors may happen and you can fix with this minimal guide

### Requires

- git

#### For `git` missing error

```Dockerfile
# FROM ...
RUN apk update && apk add --no-cache git
# your scripts
```

#### For `Alpine` incompatible error

```Dockerfile
# your scripts
RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2
CMD ["node", "server.js"]
```

## Credits

- [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js)
- [Siffr Server](https://github.com/sifrr/sifrr/tree/master/packages/server/sifrr-server)
- [fast-json-stringify](https://github.com/fastify/fast-json-stringify)
- [ajv](https://ajv.js.org)
- [cookie](https://github.com/jshttp/cookie#readme)

And to other libraries which used to create this library and without these libraries wouldn't be possible to create this library

## License

[![license](https://img.shields.io/github/license/dalisoft/nanoexpress.svg)](https://github.com/dalisoft/nanoexpress/blob/master/LICENSE)

## Support

[![Beerpay](https://img.shields.io/beerpay/dalisoft/nanoexpress.svg)](https://beerpay.io/dalisoft/nanoexpress/)
[![GitHub issues](https://img.shields.io/github/issues/dalisoft/nanoexpress.svg)](http://github.com/dalisoft/nanoexpress/issues)

- Star project
- Fork project
- Add Tests to Project
- Watch project
- Report bugs
- Fix issue
- Make PR
