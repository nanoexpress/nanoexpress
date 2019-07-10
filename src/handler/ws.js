import { ws as wsWrapper } from '../wrappers';

export default (path, options = {}, fn, config, ajv) => {
  // If users just opens WebSocket
  // without any parameters
  // we just normalize it for users
  if (typeof options === 'function' && !fn) {
    fn = options;
    options = {};
  }

  let validator = null;

  if (options.compression === undefined) {
    options.compression = 0;
  }
  if (options.maxPayloadLength === undefined) {
    options.maxPayloadLength = 16 * 1024 * 1024;
  }
  if (options.idleTimeout === undefined) {
    options.idleTimeout = 120;
  }
  if (options.schema !== undefined) {
    if (!ajv) {
      config.setAjv();
      ajv = config.ajv;
    }
    if (ajv) {
      validator = ajv.compile(options.schema);
    }
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
      if (options.schema) {
        if (typeof message === 'string') {
          if (message.indexOf('[') === 0 || message.indexOf('{') === 0) {
            if (message.indexOf('[object') === -1) {
              message = JSON.parse(message);
            }
          }
        }

        const valid = validator(message);
        if (!valid) {
          ws.emit(
            'message',
            {
              type: 'websocket.message',
              errors: validator.errors.map((err) => err.message)
            },
            isBinary
          );
          return;
        }
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
