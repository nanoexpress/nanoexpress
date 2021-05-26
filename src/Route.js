import Events from '@dalisoft/events';
import fastQueryParse from 'fast-query-parse';
import { Route as RouteCompiler } from './compilers/index.js';
import {
  httpMethods,
  prepareParams,
  prepareSwaggerDocs,
  prepareValidation,
  processValidation
} from './helpers/index.js';
import {
  body,
  cookies,
  headers,
  params,
  pipe,
  stream
} from './request-proto/http/index.js';
import { HttpResponse } from './response-proto/http/index.js';

const resAbortHandler = '___$HttpResponseAbortHandler';
const __wsProto__ = Events.prototype;

export default class Route {
  constructor(config = {}) {
    this._config = config;
    this._ajv = config.ajv;
    this._middlewares = null;

    this._baseUrl = '';

    this._module = true;
    this._rootLevel = false;

    this._console = config.console || console;
  }

  use(path, ...middlewares) {
    let { _middlewares } = this;

    if (!_middlewares) {
      _middlewares = [];
      this._middlewares = _middlewares;
    }

    if (typeof path === 'function' || (path && path._module)) {
      middlewares.unshift(path);
      path = undefined;
    }

    _middlewares.push(...middlewares);

    for (let i = 0, len = _middlewares.length, middleware; i < len; i += 1) {
      middleware = _middlewares[i];
      if (!middleware) {
        continue;
      }
      if (middleware._module) {
        middleware._ajv = this._ajv;
        middleware._config = this._config;
        middleware._app = this._app;

        if (_middlewares && _middlewares.length > 0) {
          if (middleware._middlewares) {
            if (middleware._middlewares !== _middlewares) {
              middleware._middlewares = _middlewares
                .concat(middleware._middlewares)
                .filter(
                  (currentMiddleware, index, self) =>
                    self.indexOf(currentMiddleware) === index
                );
            }
          } else {
            middleware._middlewares = _middlewares.filter(
              (currentMiddleware, index, self) =>
                self.indexOf(currentMiddleware) === index
            );
          }
        }

        if (typeof path === 'string') {
          middleware._baseUrl = path;
        } else {
          middleware._baseUrl = this._baseUrl;
          middleware._direct = true;
        }
      } else if (!middleware.path) {
        if (typeof path === 'string') {
          middleware._baseUrl = path;
        } else {
          middleware._direct = true;
          middleware._baseUrl = this._baseUrl;
        }
      }
      middleware.discard =
        (!middleware._module &&
          /res\.(json|s?end|cork|sendFile)/g.test(middleware.toString())) ||
        middleware.toString().indexOf('next') === -1;
    }

    return this;
  }

  _prepareMethod(method, { originalUrl, path }, ...middlewares) {
    const { _config, _baseUrl, _middlewares, _ajv, _console } = this;

    const fetchMethod = method === 'ANY';
    const isWebSocket = method === 'WS';
    const fetchUrl = path.indexOf('*') !== -1 || path.indexOf(':') !== -1;
    let validation = null;
    let _direct = false;
    let _schema = null;
    let isAborted = false;
    let isNotFoundHandler = false;
    let bodyAllowedMethod =
      method === 'POST' || method === 'PUT' || method === 'PATCH';

    const findConfig = middlewares.find(
      (middleware) =>
        typeof middleware === 'object' &&
        middleware &&
        (middleware.isRaw !== undefined ||
          middleware.isStrictRaw !== undefined ||
          middleware.forceRaw !== undefined ||
          middleware.noMiddleware !== undefined ||
          middleware.onAborted ||
          middleware.schema)
    );
    const isRaw = findConfig && findConfig.isRaw;
    const isStrictRaw = findConfig && findConfig.isStrictRaw;
    const forceRaw = findConfig && findConfig.forceRaw;
    const noMiddleware = findConfig && findConfig.noMiddleware;
    const onAborted = findConfig && findConfig.onAborted;
    let schema = findConfig && findConfig.schema && findConfig;

    let isCanCompiled = false;
    let compilePath;
    let compileMethod;

    middlewares = middlewares
      .filter((middleware) => typeof middleware === 'function')
      .filter((middleware, i, self) => self.indexOf(middleware) === i);

    if (_middlewares && _middlewares.length > 0) {
      middlewares = _middlewares.concat(middlewares);
    }

    if (noMiddleware) {
      middlewares.length = 0;
    }

    let routeFunction = middlewares.pop();

    // Quick dirty hack to performance improvement
    if (forceRaw) {
      if (isWebSocket) {
        const _errorContext = _console.error ? _console : console;

        _errorContext.error(
          'nanoexpress [Server]: Option `forceRaw` availbale only for HTTP Routes'
        );
      }
      return (res, req) => routeFunction(req, res);
    }

    // Filter middlewares before Compile to methods matching
    // to keep performance up-to-date
    middlewares = middlewares.filter((middleware) => {
      if (middleware.methods) {
        if (!middleware.methods.includes(method)) {
          return false;
        }
      }
      return middleware;
    });

    // Prepare params
    const preparedParams =
      (!_schema || _schema.params !== false) && prepareParams(path);

    // Quick dirty hack to performance improvement
    if (!isWebSocket && !isCanCompiled && middlewares.length === 0) {
      const compile = RouteCompiler(routeFunction, preparedParams);

      if (compile) {
        isCanCompiled = true;
        routeFunction = compile;
        compileMethod = compile.method;
        compilePath = compile.path;
      }
    }

    if (typeof path === 'function' && !routeFunction) {
      _direct = true;
      routeFunction = path;
    } else if (typeof schema === 'function' && !routeFunction) {
      routeFunction = schema;
      schema = null;
    }

    if (!fetchUrl && path.length > 1 && path.charAt(path.length - 1) === '/') {
      path = path.substr(0, path.length - 1);
    }

    const isShouldReduceTaks = isCanCompiled || isStrictRaw;
    if (!isShouldReduceTaks && !isRaw) {
      _schema = (schema && schema.schema) || undefined;
      validation = _schema && prepareValidation(_ajv, _schema);
      // eslint-disable-next-line prefer-const

      isNotFoundHandler = routeFunction.handler === 2;
      if (
        method !== 'options' &&
        (routeFunction.then ||
          routeFunction.constructor.name === 'AsyncFunction')
      ) {
        if (!/res\.(s?end|json)/g.test(routeFunction.toString())) {
          const _oldRouteFunction = routeFunction;
          routeFunction = async (req, res) => {
            const data = await _oldRouteFunction(req, res);
            if (!isAborted && data && data !== res) {
              isAborted = true;
              return res.send(data);
            }
            return null;
          };
        }
        routeFunction.isAsync = true;
      }

      middlewares = middlewares
        .filter((middleware, index, self) => self.indexOf(middleware) === index)
        .map((middleware) => {
          if (middleware.override && isNotFoundHandler) {
            isNotFoundHandler = false;
          }

          if (middleware._module) {
            return null;
          }
          if (
            middleware.then ||
            middleware.constructor.name === 'AsyncFunction'
          ) {
            return middleware;
          }
          const _oldMiddleware = middleware;
          middleware = function refactoredMiddleware(req, res) {
            return new Promise((resolve, reject) => {
              _oldMiddleware(req, res, (err, done) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(done);
                }
              });
            });
          };

          return middleware;
        })
        .filter((middleware) => typeof middleware === 'function');
    }

    if (_config && _config.swagger && schema) {
      prepareSwaggerDocs(
        _config.swagger,
        originalUrl,
        method.toLowerCase(),
        schema
      );
    }

    if (originalUrl.length > 1 && originalUrl.endsWith('/')) {
      originalUrl = originalUrl.substr(0, originalUrl.length - 1);
    }

    const _onAbortedCallbacks = (!isShouldReduceTaks || isWebSocket) && [];
    const _handleOnAborted =
      (!isShouldReduceTaks || isWebSocket) &&
      (() => {
        isAborted = true;
        if (onAborted) {
          onAborted();
        }
        if (_onAbortedCallbacks.length > 0) {
          for (let i = 0, len = _onAbortedCallbacks.length; i < len; i += 1) {
            _onAbortedCallbacks[i]();
          }
          _onAbortedCallbacks.length = 0;
        }
      });

    const attachOnAborted =
      (!isShouldReduceTaks || isWebSocket) &&
      ((fn) => {
        _onAbortedCallbacks.push(fn);
      });

    const handler =
      // eslint-disable-next-line no-nested-ternary
      isShouldReduceTaks && !isWebSocket
        ? !compilePath && !compileMethod
          ? (res, req) => routeFunction(req, res)
          : (res, req) => {
              req.method = fetchMethod ? req.getMethod().toUpperCase() : method;
              req.path = fetchUrl ? req.getUrl().substr(_baseUrl.length) : path;
              req.baseUrl = _baseUrl || '';

              // Cache value
              const reqPathLength = req.path.length;

              if (
                fetchUrl &&
                reqPathLength > 1 &&
                req.path.charAt(reqPathLength - 1) === '/'
              ) {
                req.path = req.path.substr(0, reqPathLength - 1);
              }

              // Aliases for polyfill
              req.url = req.path;
              req.originalUrl = originalUrl;

              return routeFunction(req, res);
            }
        : async (res, req) => {
            isAborted = false;
            _onAbortedCallbacks.length = 0;
            if (!isRaw) {
              res.onAborted(_handleOnAborted);
            }
            attachOnAborted(() => {
              res.aborted = true;
            });
            res[resAbortHandler] = true;

            req.method = fetchMethod ? req.getMethod().toUpperCase() : method;
            req.path = fetchUrl ? req.getUrl().substr(_baseUrl.length) : path;
            req.baseUrl = _baseUrl || '';

            if (!bodyAllowedMethod || fetchMethod) {
              bodyAllowedMethod =
                req.method === 'POST' ||
                req.method === 'PUT' ||
                req.method === 'PATCH';
            }

            // Cache value
            const reqPathLength = req.path.length;

            // Cache function
            const handleError = (err) => {
              isAborted = true;

              res.setHeader('Content-Type', 'application/json');

              if (_config._errorHandler) {
                return _config._errorHandler(err, req, res);
              }

              if (typeof err.status === 'number' && err.status !== 200) {
                res.status(err.status);
              } else if (typeof err.code === 'number' && err.code !== 200) {
                res.status(err.code);
              } else if (res.rawStatusCode === 200) {
                res.status(400);
              }

              res.end(
                `{"error":"${typeof err === 'string' ? err : err.message}"}`
              );

              return res;
            };

            if (
              fetchUrl &&
              reqPathLength > 1 &&
              req.path.charAt(reqPathLength - 1) === '/'
            ) {
              req.path = req.path.substr(0, reqPathLength - 1);
            }

            // Aliases for polyfill
            req.url = req.path;
            req.originalUrl = originalUrl;

            // Some callbacks which need for your
            req.onAborted = attachOnAborted;

            // Aliases for future usage and easy-access
            if (!isRaw) {
              req.__response = res;
              res.__request = req;

              // Extending proto
              const { __proto__ } = res;
              for (const newMethod in HttpResponse) {
                __proto__[newMethod] = HttpResponse[newMethod];
              }
              req.getIP = res.getIP;
              req.getProxiedIP = res.getProxiedIP;
              res.writeHead.notModified = true;
            }

            // Default HTTP Raw Status Code Integer
            res.rawStatusCode = 200;

            if (!isRaw && _schema !== false) {
              if (!_schema || _schema.headers !== false) {
                req.headers = headers(req, _schema && _schema.headers);
              }
              if (!_schema || _schema.cookies !== false) {
                req.cookies = cookies(req, _schema && _schema.cookies);
              }
              if (!_schema || _schema.params !== false) {
                if (req.path !== path) {
                  path = req.path;
                }
                req.params = params(req, preparedParams);
              }
              if (!_schema || _schema.query !== false) {
                req.query = fastQueryParse(req.getQuery());
              }
              if (
                req.headers &&
                ((!isRaw && bodyAllowedMethod && res.onData) ||
                  req.headers['transfer-encoding'] ||
                  (req.headers['content-length'] &&
                    +req.headers['content-length'] > 2))
              ) {
                stream(req, res);
                req.pipe = pipe;
              }
              if (req.stream && (!_schema || _schema.body !== false)) {
                await body(req);
              }
            }

            if (
              !isRaw &&
              !isAborted &&
              !isNotFoundHandler &&
              middlewares &&
              middlewares.length > 0
            ) {
              for await (const middleware of middlewares) {
                if (isAborted) {
                  break;
                }

                const response = await middleware(req, res).catch(handleError);

                if (response === res) {
                  return;
                }
              }
            }

            if (
              isAborted ||
              method === 'OPTIONS' ||
              res.stream === true ||
              res.stream === 1
            ) {
              return;
            }

            if (_direct || !fetchUrl || req.path === path) {
              if (
                !isRaw &&
                !res._modifiedEnd &&
                (!res.writeHead.notModified ||
                  (res.statusCode && res.statusCode !== 200) ||
                  res._headers)
              ) {
                res.modifyEnd();
              }

              if (
                isAborted ||
                (!isRaw &&
                  validation &&
                  processValidation(req, res, _config, validation))
              ) {
                return;
              }

              if (routeFunction.isAsync) {
                return routeFunction(req, res).catch(handleError);
              }
              return routeFunction(req, res);
            }
          };

    return handler;
  }
}

const exposeMethod = (method) =>
  function exposeMethodHOC(path, ...middlewares) {
    const { _baseUrl, _module, _app } = this;

    let originalUrl = path;
    if (middlewares.length > 0) {
      if (_baseUrl !== '' && _module && originalUrl.indexOf(_baseUrl) === -1) {
        originalUrl = _baseUrl + path;
      }

      const preparedRouteFunction = this._prepareMethod(
        method.toUpperCase(),
        { path, originalUrl },
        ...middlewares
      );

      _app[method](originalUrl, preparedRouteFunction);
    }

    return this;
  };

for (let i = 0, len = httpMethods.length; i < len; i += 1) {
  const method = httpMethods[i];
  Route.prototype[method] = exposeMethod(method);
}

// PubSub methods expose
Route.prototype.publish = (topic, message, isBinary, compress) =>
  this._app.publish(topic, message, isBinary, compress);

Route.prototype.ws = function wsExpose(path, handler, options = {}) {
  const { _baseUrl, _module, _ajv, _app } = this;

  const { isRaw, isStrictRaw, schema } = options;

  const _schema = (schema && schema.schema) || undefined;
  const validation = _schema && prepareValidation(_ajv, _schema);

  let originalUrl = path;
  if (_baseUrl !== '' && _module && originalUrl.indexOf(_baseUrl) === -1) {
    originalUrl = _baseUrl + path;
  }
  if (isRaw || isStrictRaw || typeof options.open === 'function') {
    _app.ws(path, options);
    return;
  }

  Object.assign(
    options,
    {
      compression: 0,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 120
    },
    options
  );

  _app.ws(path, {
    ...options,
    open(ws) {
      ws.emit('connection', ws);
    },
    async upgrade(res, req, context) {
      const secWsKey = req.getHeader('sec-websocket-key');
      const secWsProtocol = req.getHeader('sec-websocket-protocol');
      const secWsExtensions = req.getHeader('sec-websocket-extensions');

      let aborted = false;
      res.onAborted(() => {
        aborted = true;
      });

      if (!res.___events) {
        res.on = __wsProto__.on;
        res.once = __wsProto__.once;
        res.off = __wsProto__.off;
        res.emit = __wsProto__.emit;

        res.___events = [];
      }

      res.emit('upgrade', req, res);

      await handler(req, res).catch((error) => {
        aborted = true;
        res.emit('error', error);
      });
      if (!aborted) {
        res.upgrade(
          { req, ...res },
          secWsKey,
          secWsProtocol,
          secWsExtensions,
          context
        );
      }
    },
    message: (ws, message, isBinary) => {
      if (!isBinary) {
        message = Buffer.from(message).toString('utf8');
      }
      if (options.schema) {
        if (typeof message === 'string') {
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
  });
};
