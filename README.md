# nanoexpress Pro ESM

[![Greenkeeper badge](https://badges.greenkeeper.io/dalisoft/nanoexpress.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/dalisoft/nanoexpress.svg)](http://github.com/dalisoft/nanoexpress)
[![Code Climate](https://codeclimate.com/github/dalisoft/nanoexpress/badges/gpa.svg)](https://codeclimate.com/github/dalisoft/nanoexpress)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/dalisoft/nanoexpress/badges/quality-score.png?b=pro-esm)](https://scrutinizer-ci.com/g/dalisoft/nanoexpress/?branch=pro-esm)
[![Coverage Status](https://coveralls.io/repos/github/dalisoft/nanoexpress/badge.svg?branch=pro-esm)](https://coveralls.io/github/dalisoft/nanoexpress?branch=pro-esm)

Nano-framework for Node.js powered by uWebSockets.js

## Documentation available [here](https://github.com/dalisoft/nanoexpress/blob/pro-esm/docs/index.md)

## Warning

- This library does not support HTTP2!
- This branch (pro-esm) is differs from master/pro branches
- This branch always be up-to-date
- This branch gets new features faster than master/pro branches
- This branch is paid for commercial products if sources are closed

## Requires

- Node.js v12 or greater
- developer, already worked with nanoexpress before

## Benchmarks

| Library         | RPS   | Memory |
| --------------- | ----- | ------ |
| uWebSockets.js  | 2M    | 80Mb   |
| nanoexpress Pro | 1.79M | 180Mb  |
| nanoexpress     | 1.65M | 120Mb  |
| Raw HTTP        | 1.03M | 290Mb  |
| express         | 654K  | 430Mb  |

Benchmarked on my macBook Pro 2012 13" (Core i5, 8Gb RAM) performance.

**Note**: _Real-world app memory/rps may differs from these numbers and these numbers are in my macBook_

_You can install `wrk` via `Homebrew` in `macOS` or `Linux`_

**Benchmark command**: `wrk -t4 -d100 -c10`

## Features

- Async/Await out-of-the-box
- No async mode supported
- Easy to use (for Express users especially)
- Blazing fast performance
- Resource (CPU / Memory) effecient
- Familiar API
- Normalised API
- Express-compatible middleware
- In-built middlewares
- In-built Stream (Video stream, yay!) support
- In-built WebSocket support (Express-like API and Events)
- In-built Schema validator via `Ajv`
- Out-of-the-box `fast-json-stringify` support via `{schema}` middleware
- Small working examples
- TypeScript declaration
- Tests and CI checked code

## Examples

All examples are lives [here](https://github.com/dalisoft/nanoexpress/tree/pro-esm/examples)

## Credits

- [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js)
- [fast-json-stringify](https://github.com/fastify/fast-json-stringify)
- [ajv](https://ajv.js.org)
- [cookie](https://github.com/jshttp/cookie#readme)

And to other libraries which used to create this library and without these libraries wouldn't be possible to create this library

## Sponsors

> Sponsors will get access to private Telegram all-before updates, votes and discussion chat
> Sponsors can use `nanoexpress Pro` to many apps even sources are closed for them applies Apache 2.0 License

[Sergey N](https://github.com/mrauhu)

## License

This project is licensed under GPL-3.0 license and if you want use this on commercial projects with closed sources, you should contact to me via dalisoft@mail.ru for getting license
