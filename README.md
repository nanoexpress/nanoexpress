# nanoexpress

Nano-framework for Node.js powered by uWebSockets.js

## NOTE

This application isn't production ready and use at your own risk

## Motiviation

I've long-time planned somehow create own Express-like alternative Node.js framework, then seen uWebSockets.js. Almost 2 month i've think how do this right and decided to create Node.js framework with almost same as Express API.

This library makes very thin layer between uWebSockets.js and your code, maximum 5% performance loss, not more. But, gives you very Familiar and Clean API. Async/Await supported out-of-the-box!

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
- In-built Stream (Video stream, yay!) support
- In-built WebSocket support (Express-like API and Events)
- `fast-json-stringify` support

## Credits

- [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js)

And to other libraries which used to create this library and without these libraries wouldn't be possible to create this library

## License

Apache-2.0
