# WebRTC

Performance tip: _Using `schema` option may improve safety by validating messages and gives you auto-parsing of messages_

Note: Don't forget to import [WebRTC define](../src/packed/defines/webrtc.js)

Note 2: First argument is optional and by default is `/webrtc`

## Importing WebRTC

```js
import { webRTC } from 'nanoexpress/src/packed/defines';

app.define(webRTC);
```

## Just example

To be working, just use `WebRTC` define made by nanoexpress developers.

```js
app.webrtc('/webrtc');
```

## Examples

- [Simple WebRTC example](../examples/webrtc.js)

[&laquo; WebSocket](./websocket.md)

[Routes &raquo;](./routes.md)
