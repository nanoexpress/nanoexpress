# Defines

Note: _This method basically used for definint method methods for `app` instance, but not limited to_

## Packed defines

- [WebRTCServer](../src/packed/defines/webrtc-server.js)
- [proxy](../src/packed/defines/proxy.js)

## Demo of defines

- [WebRTCServer](../examples/webrtc.js)
- [proxy](../examples/proxy.js)

## How it works

```js
const yourDefine = (app) => {
  app._myDefine = true;
};
```

## Usage

```js
import yourDefine from 'your-define-name';

app.define(yourDefine);

console.log(app._myDefine); // -> true
```

[&laquo; Middlewares](./middlewares.md)

[WebSocket &raquo;](./websocket.md)
