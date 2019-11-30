import {
  headers,
  cookies,
  queries,
  params,
  body
} from './normalizers/index.js';
import { HttpResponse } from './proto/index.js';
import { Route as RouteCompiler } from './compilers/index.js';
import {
  prepareSwaggerDocs,
  prepareValidation,
  prepareParams,
  processValidation,
  httpMethods
} from './helpers/index.js';

export default class Route {
  constructor(config = {}) {
    this._config = config;
    this._ajv = config.ajv;
    this._middlewares = null;

    this._baseUrl = '';

    this._module = true;
    this._rootLevel = false;
  }
  use(path, ...middlewares) {
    let { _middlewares } = this;

    if (!_middlewares) {
      _middlewares = [];
      this._middlewares = _middlewares;
    }

    if (typeof path === 'function') {
      middlewares.unshift(path);
      path = undefined;
    }

    _middlewares.push(...middlewares);

    for (let i = 0, len = _middlewares.length, middleware; i < len; i++) {
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
                  (middleware, i, self) => self.indexOf(middleware) === i
                );
            }
          } else {
            middleware._middlewares = _middlewares.filter(
              (middleware, i, self) => self.indexOf(middleware) === i
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
    // eslint-disable-next-line no-unused-vars
    const { _config, _baseUrl, _middlewares, _module, _rootLevel, _ajv } = this;

    const fetchMethod = method.toUpperCase() === 'ANY';
    const fetchUrl = path === '/*' || path.indexOf(':') !== -1;
    let validation = null;
    let _direct = false;
    let _schema = null;
    let isAborted = false;
    let isNotFoundHandler = false;
    const bodyAllowedMethod =
      method === 'POST' || method === 'PUT' || method === 'DEL';
    let responseSchema;

    const findConfig = middlewares.find(
      (middleware) =>
        typeof middleware === 'object' &&
        middleware &&
        (middleware.isRaw !== undefined ||
          middleware.isStrictRaw !== undefined ||
          middleware.forceRaw !== undefined ||
          middleware.noMiddleware !== undefined ||
          middleware.onAborted ||
          middlewares.schema)
    );
    const isRaw = findConfig && findConfig.isRaw;
    const isStrictRaw = findConfig && findConfig.isStrictRaw;
    const forceRaw = findConfig && findConfig.forceRaw;
    const noMiddleware = findConfig && findConfig.noMiddleware;
    const onAborted = findConfig && findConfig.onAborted;
    let schema = findConfig && findConfig.schema;

    let isCanCompiled = false;

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
      return (res, req) => routeFunction(req, res);
    }

    // Quick dirty hack to performance improvement
    if (!isCanCompiled && middlewares.length === 0) {
      const compile = RouteCompiler(routeFunction);

      if (compile) {
        isCanCompiled = true;
        routeFunction = compile;
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
      responseSchema = _schema && validation && validation.responseSchema;

      isNotFoundHandler = routeFunction.handler === 2;
      if (
        method !== 'options' &&
        (routeFunction.then ||
          routeFunction.constructor.name === 'AsyncFunction') &&
        !/res\.(s?end|json)/g.test(routeFunction.toString())
      ) {
        const _oldRouteFunction = routeFunction;
        routeFunction = (req, res) => {
          return _oldRouteFunction(req, res)
            .then((data) => {
              if (!isAborted && data && data !== res) {
                isAborted = true;
                return res.send(data);
              }
              return null;
            })
            .catch((err) => {
              if (!isAborted) {
                if (_config._errorHandler) {
                  return _config._errorHandler(err, req, res);
                }
                res.status(err.code || err.status || 500);
                res.send({ error: err.message });
                isAborted = true;
              }
              return null;
            });
        };
      }

      middlewares = middlewares
        .filter((middleware, index, self) => self.indexOf(middleware) === index)
        .map((middleware) => {
          if (middleware.override && isNotFoundHandler) {
            isNotFoundHandler = false;
          }
          if (middleware._module) {
            return null;
          } else if (
            middleware.then ||
            middleware.constructor.name === 'AsyncFunction'
          ) {
            return null;
          } else {
            const _oldMiddleware = middleware;
            middleware = function(req, res) {
              return new Promise((resolve) => {
                _oldMiddleware(req, res, (err, done) => {
                  if (err) {
                    if (_config._errorHandler) {
                      return _config._errorHandler(err, req, res);
                    }

                    res.status(err.status || err.code || 400, true);
                    res.writeStatus(res.statusCode);
                    res.writeHeader(
                      'Content-Type',
                      'application/json; charset=utf-8'
                    );

                    resolve();
                    res.end(
                      `{"error":"${
                        typeof err === 'string' ? err : err.message
                      }"}`
                    );
                    isAborted = true;
                  } else {
                    resolve(done);
                  }
                });
              });
            };
          }
          return middleware;
        })
        .filter((middleware) => typeof middleware === 'function');
    }

    if (_config && _config.swagger && schema) {
      prepareSwaggerDocs(_config.swagger, path, method, schema);
    }

    if (originalUrl.length > 1 && originalUrl.endsWith('/')) {
      originalUrl = originalUrl.substr(0, originalUrl.length - 1);
    }

    const preparedParams =
      !isShouldReduceTaks &&
      (!_schema || _schema.params !== false) &&
      prepareParams(path);

    const _onAbortedCallbacks = !isShouldReduceTaks && [];
    const _handleOnAborted =
      !isShouldReduceTaks &&
      (() => {
        isAborted = true;
        if (onAborted) {
          onAborted();
        }
        if (_onAbortedCallbacks.length > 0) {
          for (let i = 0, len = _onAbortedCallbacks.length; i < len; i++) {
            _onAbortedCallbacks[i]();
          }
          _onAbortedCallbacks.length = 0;
        }
      });

    const attachOnAborted =
      !isShouldReduceTaks &&
      ((fn) => {
        _onAbortedCallbacks.push(fn);
      });

    return isShouldReduceTaks
      ? (res, req) => {
        req.method = fetchMethod ? req.getMethod().toUpperCase() : method;
        req.path = fetchUrl ? req.getUrl().substr(_baseUrl.length) : path;
        req.baseUrl = _baseUrl || req.baseUrl;

        // Cache value
        const reqPathLength = req.path.length;

        if (
          fetchUrl &&
            reqPathLength.length > 1 &&
            req.path.charAt(reqPathLength - 1) === '/'
        ) {
          req.path = req.path.substr(0, reqPathLength - 1);
        }

        // Aliases for polyfill
        req.url = req.path;
        req.originalUrl = originalUrl;
        req.baseUrl = _baseUrl || '';

        return routeFunction(req, res);
      }
      : async (res, req) => {
        isAborted = false;
        !isRaw && res.onAborted(_handleOnAborted);

        req.method = fetchMethod ? req.getMethod().toUpperCase() : method;
        req.path = fetchUrl ? req.getUrl().substr(_baseUrl.length) : path;
        req.baseUrl = _baseUrl || req.baseUrl;

        // Cache value
        const reqPathLength = req.path.length;

        if (
          fetchUrl &&
            reqPathLength.length > 1 &&
            req.path.charAt(reqPathLength - 1) === '/'
        ) {
          req.path = req.path.substr(0, reqPathLength - 1);
        }

        // Aliases for polyfill
        req.url = req.path;
        req.originalUrl = originalUrl;
        req.baseUrl = _baseUrl || '';

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
          req.getIP = res._getResponseIP;
          res.writeHead.notModified = true;
        }

        // Default HTTP Raw Status Code Integer
        res.rawStatusCode = 200;

        // Assign schemas
        if (responseSchema) {
          res.fastJson = responseSchema;
        }

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
            req.query = queries(req, _schema && _schema.query);
          }
          if (bodyAllowedMethod && (!_schema || _schema.body !== false)) {
            const bodyResponse = await body(req, res, attachOnAborted);

            if (bodyResponse) {
              req.body = bodyResponse;
            }
          }
        }

        if (
          !isRaw &&
            !isAborted &&
            !isNotFoundHandler &&
            middlewares &&
            middlewares.length > 0
        ) {
          for (
            let i = 0, len = middlewares.length, middleware;
            i < len;
            i++
          ) {
            middleware = middlewares[i];

            if (isAborted) {
              break;
            }

            await middleware(req, res);
          }
        }

        if (isAborted || method === 'OPTIONS') {
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
                validation.validationStringify &&
                processValidation(req, res, _config, validation))
          ) {
            return;
          }

          return routeFunction(req, res);
        }
      };
  }
}

for (let i = 0, len = httpMethods.length; i < len; i++) {
  const method = httpMethods[i];
  Route.prototype[method] = function(path, ...middlewares) {
    const { _baseUrl, _module, _app } = this;

    let originalUrl = path;
    if (middlewares.length > 0) {
      if (_baseUrl !== '' && _module && originalUrl.indexOf(_baseUrl) === -1) {
        originalUrl = _baseUrl + path;
      }

      _app[method](
        originalUrl + '/',
        this._prepareMethod(
          method.toUpperCase(),
          { path, originalUrl },
          ...middlewares
        )
      );
    }

    return this;
  };
}
