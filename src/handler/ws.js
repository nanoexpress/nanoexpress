import { headers, cookies, queries, params } from '../normalizers/index.js';

import Events from '@dalisoft/events';

const __wsProto__ = Events.prototype;

export default (path, options = {}, fn, ajv) => {
  if (typeof options === 'function' && !fn) {
    fn = options;
    options = {};
  }

  let validator = null;
  const { schema } = options;

  Object.assign(
    options,
    {
      compression: 0,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 120
    },
    options
  );
  if (schema) {
    if (ajv) {
      validator = ajv.compile(schema);
    }
  }

  return {
    ...options,
    open: (ws, req) => {
      req.rawPath = path;
      req.path = req.getUrl();
      req.baseUrl = '';
      req.originalUrl = req.path;
      req.url = req.path;

      if (!req.headers) {
        req.headers =
          !schema || schema.headers !== false
            ? headers(req, req.headers, schema && schema.headers)
            : req.headers;
      }
      if (!req.cookies) {
        req.cookies =
          !schema || schema.cookies !== false
            ? cookies(req, req.cookies, schema && schema.cookies)
            : req.cookies;
      }
      if (!req.params) {
        req.params =
          !schema || schema.params !== false
            ? params(req, req.params, schema && schema.params)
            : req.params;
      }
      if (!req.query) {
        req.query =
          !schema || schema.query !== false
            ? queries(req, req.query, schema && schema.query)
            : req.query;
      }
      if (!ws.___events) {
        ws.on = __wsProto__.on;
        ws.once = __wsProto__.once;
        ws.off = __wsProto__.off;
        ws.emit = __wsProto__.emit;

        ws.___events = [];
      }
      fn(req, ws);
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
          }
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
