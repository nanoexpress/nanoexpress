import { headers, cookies, queries, params, body } from './normalizers';
import { HttpResponse } from './proto';
import {
  prepareSwaggerDocs,
  prepareValidation,
  processValidation,
  httpMethods
} from './helpers';

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

        if (typeof path === 'string') {
          middleware._baseUrl = path;
          middleware.path = path;
        } else {
          middleware._baseUrl = this._baseUrl;
          middleware._direct = true;
        }
      } else if (!middleware.path) {
        if (typeof path === 'string') {
          middleware._baseUrl = path;
          middleware.path = path;
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
  _prepareMethod(method, path, schema, ...middlewares) {
    const { _config, _baseUrl, _middlewares, _module, _rootLevel, _ajv } = this;

    const fetchMethod = method === 'any';
    const fetchUrl = path.indexOf(':') !== -1 || (_module && !_rootLevel);
    let validation = null;
    let _direct = false;
    let _schema = null;
    let isAborted = false;
    let _isAbortHandler = false;
    const bodyAllowedMethod =
      method === 'post' || method === 'put' || method === 'del';
    let responseSchema;
    const isRaw = middlewares.find(
      (middleware) =>
        typeof middleware === 'object' &&
        middleware &&
        middleware.isRaw === true
    );
    const noMiddleware = middlewares.find(
      (middleware) =>
        typeof middleware === 'object' &&
        middleware &&
        middleware.noMiddleware === true
    );

    middlewares = middlewares.filter(
      (middleware) => typeof middleware === 'function'
    );

    if (_middlewares && _middlewares.length > 0) {
      middlewares = _middlewares.concat(middlewares);
    }
    if (noMiddleware) {
      middlewares.length = 0;
    }

    let routeFunction = middlewares.pop();

    if (typeof path === 'function' && !routeFunction) {
      _direct = true;
      routeFunction = path;
    } else if (typeof schema === 'function' && !routeFunction) {
      routeFunction = schema;
      schema = null;
    }

    _schema = (schema && schema.schema) || undefined;
    validation = _schema && prepareValidation(_ajv, _schema);
    // eslint-disable-next-line prefer-const
    responseSchema = _schema && validation && validation.responseSchema;

    if (
      routeFunction.then ||
      routeFunction.constructor.name === 'AsyncFunction'
    ) {
      const _oldRouteFunction = routeFunction;
      routeFunction = (req, res) => {
        if (!_isAbortHandler && !finished) {
          res.onAborted(() => {
            isAborted = true;
          });
          _isAbortHandler = true;
        }
        return _oldRouteFunction(req, res)
          .then((data) => {
            if (!isAborted && data && data !== res) {
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
              return res.send({ error: err.message });
            }
            return null;
          });
      };

      routeFunction.async = true;
    }

    middlewares = middlewares.map((middleware) => {
      if (middleware.then || middleware.constructor.name === 'AsyncFunction') {
        // do nothing
      } else {
        const _oldMiddleware = middleware;
        middleware = (req, res) =>
          new Promise((resolve) => {
            _oldMiddleware(req, res, (err, done) => {
              if (err) {
                finished = true;
                if (_config._errorHandler) {
                  return _config._errorHandler(err, req, res);
                }
                res.statusCode = err.code || err.status || 400;
                res.send(
                  `{"error":"${typeof err === 'string' ? err : err.message}"}`
                );
                resolve();
              } else {
                resolve(done);
              }
            });
          });
      }
      return middleware;
    });

    if (_baseUrl !== '' && _module && path.indexOf(_baseUrl) === -1) {
      path = _baseUrl + path;
    }

    if (_config && _config.swagger && schema) {
      prepareSwaggerDocs(_config.swagger, routeFunction.path, method, schema);
    }

    if (!_config.strictPath && path) {
      if (
        path.charAt(path.length - 1) !== '/' &&
        Math.abs(path.lastIndexOf('.') - path.length) > 5
      ) {
        path += '/';
      }
    }

    let finished = false;

    return async (res, req) => {
      isAborted = false;
      res.onAborted(() => {
        isAborted = true;
      });

      req.rawPath = path;
      req.method = fetchMethod ? req.getMethod() : method;
      req.path = fetchUrl ? req.getUrl() : path;
      req.baseUrl = _baseUrl || req.baseUrl;
      req.rawPath = path || req.path;

      // Aliases for polyfill
      req.url = req.path;
      req.originalUrl = req.url;
      req.baseUrl = _baseUrl || '';

      // Aliases for future usage and easy-access
      if (!isRaw) {
        req.__response = res;
        res.__request = req;

        // Extending proto
        const { __proto__ } = res;
        for (const newMethod in HttpResponse) {
          __proto__[newMethod] = HttpResponse[newMethod];
        }
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
          req.params = params(req, _schema && _schema.params);
        }
        if (!_schema || _schema.query !== false) {
          req.query = queries(req, _schema && _schema.query);
        }
      }

      // Caching value may improve performance
      // by avoid re-reference items over again
      let reqPathLength = req.path.length;

      if (middlewares && middlewares.length > 0) {
        for (let i = 0, len = middlewares.length, middleware; i < len; i++) {
          middleware = middlewares[i];

          if (finished) {
            break;
          }

          if (
            !isRaw &&
            middleware._module &&
            req.path.indexOf(middleware._baseUrl) !== -1
          ) {
            await middleware.run(res, req);
          } else {
            await middleware(req, res);
          }
        }
      }

      if (finished || isAborted) {
        return;
      }

      if (!_config.strictPath && reqPathLength > 1) {
        if (
          req.path.charAt(reqPathLength - 1) !== '/' &&
          Math.abs(req.path.lastIndexOf('.') - req.path.length) > 5
        ) {
          req.path += '/';
          reqPathLength += 1;
        }
      }

      if (_direct || !fetchUrl || req.path === path) {
        if (
          !isRaw &&
          (!res._modifiedEnd &&
            (!res.writeHead.notModified ||
              (res.statusCode && res.statusCode !== 200) ||
              res._headers))
        ) {
          res.modifyEnd();
        }

        if (
          !isRaw &&
          bodyAllowedMethod &&
          res.onData &&
          _schema !== false &&
          (!_schema || !_schema.body !== false)
        ) {
          const bodyResponse = await body(req, res);

          if (isAborted) {
            return;
          }
          if (bodyResponse) {
            req.body = bodyResponse;
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
        } else {
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
      }
    };
  }
}

for (let i = 0, len = httpMethods.length; i < len; i++) {
  const method = httpMethods[i];
  Route.prototype[method] = function(path, schema, routeFunction, isRaw) {
    return this._addMethod(method, path, schema, routeFunction, isRaw);
  };
}
