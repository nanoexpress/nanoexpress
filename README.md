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

_If you want **Suport** me, please see [Support](#support) section_

_See [**Credits**](#credits) if you want which libraries i've used_

## NOTE

This application isn't production ready and use at your own risk

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
- In-box `body-parser` middleware (JSON, FormEncoded, Plain, XML)
- In-box `cookie` middleware
- In-built Stream (Video stream, yay!) support
- In-built WebSocket support (Express-like API and Events)
- In-built Schema validator via `Ajv`
- Out-of-the-box `fast-json-stringify` support via `{schema}` middleware
- TypeScript declaration
- Testing and CI checked code

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
- `cors` (yes, `express` `cors` middleware)

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
- Watch project
- Report bugs
- Fix issue
- Make PR
