import EventsEmitter from 'events';

export default function exposeWebsocket(handler, options = {}) {
  const { isRaw, isStrictRaw, validator: validation } = options;

  if (typeof handler === 'object') {
    options = handler;
    handler = null;
  }

  if (isRaw || isStrictRaw || typeof options.open === 'function') {
    return options;
  }

  return {
    ...options,
    open(ws) {
      ws.emit('connection', ws);
    },
    async upgrade(res, req, context) {
      const secWsKey = req.getHeader('sec-websocket-key');
      const secWsProtocol = req.getHeader('sec-websocket-protocol');
      const secWsExtensions = req.getHeader('sec-websocket-extensions');

      const events = new EventsEmitter();

      res.on = events.on.bind(events);
      res.once = events.once.bind(events);
      res.off = events.off.bind(events);
      res.emit = events.emit.bind(events);

      let aborted = false;
      res.onAborted(() => {
        aborted = true;
        events.emit('error', { aborted });
      });

      res.emit('upgrade', req, res);

      await handler(req, res).catch((error) => {
        aborted = true;
        events.emit('error', error);
      });
      const context = {};
      if (!aborted) {
        events.emit('willUpgrade', req);
        res.upgrade(
          { req, ...res },
          secWsKey,
          secWsProtocol,
          secWsExtensions,
          context
        );
        events.emit('upgraded', req);
      }
    },
    message: (ws, message, isBinary) => {
      if (!isBinary) {
        message = Buffer.from(message).toString('utf8');
      }
      if (options.schema) {
        if (typeof validation === 'function' && typeof message === 'string') {
          if (message.indexOf('[') === 0 || message.indexOf('{') === 0) {
            if (message.indexOf('[object') === -1) {
              message = JSON.parse(message);

              const valid = validation(message);
              if (!valid) {
                ws.emit(
                  'message',
                  {
                    type: 'websocket.message',
                    errors: validation.errors.map((err) => err.message)
                  },
                  isBinary
                );
                return;
              }
            }
          }
        }
      }
      ws.emit('message', message, isBinary);
    },
    drain: (ws) => {
      ws.emit('drain', ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      ws.emit('close', code, Buffer.from(message).toString('utf8'));
    }
  };
}
