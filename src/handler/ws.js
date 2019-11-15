import { headers, cookies, queries, params } from '../normalizers/index.js';
import { prepareParams } from '../helpers/index.js';

import Events from '@dalisoft/events';

const __wsProto__ = Events.prototype;

export default (path, options = {}, fn, ajv) => {
  if (typeof options === 'function' && !fn) {
    fn = options;
    options = {};
  }

  let validator = null;
  const { schema, isRaw } = options;

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

  const fetchUrl = path === '/*' || path.indexOf(':') !== -1;
  const rawPath = path;
  const preparedParams =
    path.indexOf(':') !== -1 &&
    (!schema || schema.params !== false) &&
    prepareParams(path);

  return {
    ...options,
    open: (ws, req) => {
      req.rawPath = rawPath;
      req.path = fetchUrl ? req.getUrl() : path;
      req.baseUrl = '';
      req.originalUrl = req.path;
      req.url = req.path;

      if (!isRaw && schema !== false) {
        if (!schema || schema.headers !== false) {
          req.headers = headers(req, schema && schema.headers);
        }
        if (!schema || schema.cookies !== false) {
          req.cookies = cookies(req, schema && schema.cookies);
        }
        if (!schema || schema.params !== false) {
          if (req.path !== path) {
            path = req.path;
          }
          req.params = params(req, preparedParams);
        }
        if (!schema || schema.query !== false) {
          req.query = queries(req, schema && schema.query);
        }
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
