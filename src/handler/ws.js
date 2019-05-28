import { ws as wsWrapper } from '../wrappers';

export default (path, options = {}, fn) => {
  // If users just opens WebSocket
  // without any parameters
  // we just normalize it for users
  if (typeof options === 'function' && !fn) {
    fn = options;
    options = {};
  }

  if (options.compression === undefined) {
    options.compression = 0;
  }
  if (options.maxPayloadLength === undefined) {
    options.maxPayloadLength = 16 * 1024 * 1024;
  }
  if (options.idleTimeout === undefined) {
    options.idleTimeout = 120;
  }

  return {
    ...options,
    open: (ws, req) => {
      // For future usage
      req.rawPath = path;

      const request = wsWrapper.request(req, ws);
      const websocket = wsWrapper.ws(ws);
      fn(request, websocket);
    },
    message: (ws, message, isBinary) => {
      if (!isBinary) {
        message = Buffer.from(message).toString('utf-8');
      }
      ws.emit('message', message, isBinary);
    },
    drain: (ws) => {
      ws.emit('drain', ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      ws.emit('close', code, Buffer.from(message).toString('utf-8'));
    }
  };
};
