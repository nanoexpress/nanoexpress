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
    this._methods = null;
    this._next = true;

    this._baseUrl = '';

    this.run = this.run.bind(this);
    this._handleNext = this._handleNext.bind(this);

    this._module = true;
    this._rootLevel = false;
  }
  use(path, ...middlewares) {
    let { _methods } = this;

    if (!_methods) {
      _methods = {};
      this._methods = _methods;
    }

    if (!_methods.any) {
      _methods.any = [];
    }

    const anyMethodCallbacks = _methods.any;

    anyMethodCallbacks.push(...middlewares);

    for (let i = 0, len = anyMethodCallbacks.length, callback; i < len; i++) {
      callback = anyMethodCallbacks[i];
      if (!callback) {
        continue;
      }
      if (callback._module) {
        callback._ajv = this._ajv;
        callback._config = this._config;

        if (typeof path === 'string') {
          callback._baseUrl = path;
          callback.path = path;
        } else {
          callback._baseUrl = this._baseUrl;
        }
      } else if (!callback.path) {
        if (typeof path === 'string') {
          callback._baseUrl = path;
          if (typeof path === 'string') {
            callback._baseUrl = path;
          } else {
            callback._baseUrl = this._baseUrl;
          }
        } else {
          callback._direct = true;
          callback._baseUrl = '';
        }
      }
      callback.discard =
        (!callback._module &&
          /res\.(json|s?end|cork|sendFile)/g.test(callback.toString())) ||
        callback.toString().indexOf('next') === -1;
    }

    return this;
  }
  _handleNext(err, done = true) {
    const { _config, _req, _res } = this;

    if (err) {
      if (_config._errorHandler) {
        return _config._errorHandler(err, _req, _res);
      }
      return _res.end(`{error":"${err.message}"}`);
    } else {
      this._next = done;
    }

    this._req = null;
    this._res = null;
  }
  _addMethod(method, path, schema, routeFunction, isRaw = false) {
    let { _methods } = this;
    const { _config } = this;

    if (!_methods) {
      _methods = {};
      this._methods = _methods;
    }

    if (!_methods[method]) {
      _methods[method] = [];
    }

    const methodArray = _methods[method];

    if (typeof path === 'function' && !routeFunction) {
      path._direct = true;

      routeFunction = path;
    }
    if (typeof schema === 'function' && !routeFunction) {
      routeFunction = schema;

      schema = null;
    }

    if (
      routeFunction.then ||
      routeFunction.constructor.name === 'AsyncFunction'
    ) {
      const _oldRouteFunction = routeFunction;
      routeFunction = (req, res, next) => {
        let isAborted = false;
        res.onAborted(() => {
          isAborted = true;
        });
        return _oldRouteFunction(req, res)
          .then((data) => {
            if (!isAborted) {
              res.send(data);
            }
            next(null, data);
          })
          .catch(next);
      };
      // Maybe we later use this property
      routeFunction.async = true;
    }

    const exactlySchema = (schema && schema.schema) || undefined;

    routeFunction.isRaw = isRaw;
    routeFunction.path = path;
    routeFunction.schema = exactlySchema;
    routeFunction.validation =
      exactlySchema && prepareValidation(this._ajv, exactlySchema);

    routeFunction.discard =
      /res\.(json|s?end|cork|sendFile)/g.test(routeFunction.toString()) ||
      routeFunction.toString().indexOf('next') === -1;

    if (
      this._baseUrl !== '' &&
      this._module &&
      routeFunction.path.indexOf(this._baseUrl) === -1
    ) {
      routeFunction.path = this._baseUrl + routeFunction.path;
    }

    if (_config && _config.swagger && schema) {
      prepareSwaggerDocs(_config.swagger, routeFunction.path, method, schema);
    }

    if (!this._config.strictPath && routeFunction.path) {
      if (
        routeFunction.path.charAt(routeFunction.path.length - 1) !== '/' &&
        Math.abs(
          routeFunction.path.lastIndexOf('.') - routeFunction.path.length
        ) > 5
      ) {
        routeFunction.path += '/';
      }
    }

    methodArray.push(routeFunction);

    return this;
  }
  run(res, req) {
    this._next = true;

    this._req = req;
    this._res = res;

    const { _methods, _config } = this;

    if (_methods) {
      req.method = req.method || req.getMethod();
      req.path = req.path || req.getUrl();

      // Aliases for polyfill
      req.url = req.path;
      req.originalUrl = req.url;
      req.baseUrl = this._baseUrl || '';

      // Aliases for future usage and easy-access
      req.__response = res;
      res.__request = req;

      // Extending proto
      const { __proto__ } = res;
      for (const newMethod in HttpResponse) {
        __proto__[newMethod] = HttpResponse[newMethod];
      }

      // Default HTTP Raw Status Code Integer
      res.rawStatusCode = 200;

      // Caching value may improve performance
      // by avoid re-reference items over again
      let anyRoutesCalled = false;
      let reqPathLength = req.path.length;
      const reqMethod = req.method;
      const bodyAllowedMethod =
        reqMethod === 'post' || reqMethod === 'put' || reqMethod === 'del';

      if (!_config.strictPath) {
        if (
          req.path.charAt(reqPathLength - 1) !== '/' &&
          Math.abs(req.path.lastIndexOf('.') - req.path.length) > 5
        ) {
          req.path += '/';
          reqPathLength += 1;
        }
      }

      for (const method in _methods) {
        if (method === 'any' || method === reqMethod) {
          const methodArray = _methods[method];

          if (anyRoutesCalled) {
            break;
          }

          for (
            let i = 0, routeFunction, len = methodArray.length;
            i < len;
            i++
          ) {
            routeFunction = methodArray[i];

            if (!routeFunction) {
              continue;
            }

            if (!this._next) {
              break;
            }

            if (
              !routeFunction.isRaw &&
              routeFunction._module &&
              req.path.indexOf(routeFunction._baseUrl) !== -1
            ) {
              routeFunction.run(res, req);
              routeFunction._next = true;
              this._next = true;
              anyRoutesCalled = true;
              continue;
            }

            if (routeFunction._direct || req.path === routeFunction.path) {
              if (routeFunction.discard) {
                anyRoutesCalled = true;
              }

              this._next = false;

              req.rawPath = routeFunction.path || req.path;
              req.baseUrl = routeFunction._baseUrl || req.baseUrl;

              const schema = routeFunction.schema;
              const isRaw = routeFunction.isRaw;

              res.schema =
                routeFunction.validation &&
                routeFunction.validation.responseSchema;

              if (!isRaw && !req.headers) {
                req.headers =
                  !schema || schema.headers !== false
                    ? headers(req, req.headers, schema && schema.headers)
                    : req.headers;
              }
              if (!isRaw && !req.cookies) {
                req.cookies =
                  !schema || schema.cookies !== false
                    ? cookies(req, req.cookies, schema && schema.cookies)
                    : req.cookies;
              }
              if (!isRaw && !req.params) {
                req.params =
                  !schema || schema.params !== false
                    ? params(req, req.params, schema && schema.params)
                    : req.params;
              }
              if (!isRaw && !req.query) {
                req.query =
                  !schema || schema.query !== false
                    ? queries(req, req.query, schema && schema.query)
                    : req.query;
              }

              if (!isRaw && bodyAllowedMethod && !req.body) {
                let isAborted = false;
                res.onAborted(() => {
                  isAborted = true;
                });
                return body(req, res).then((bodyResponse) => {
                  if (isAborted) {
                    return;
                  }
                  if (bodyResponse) {
                    req.body = bodyResponse;

                    if (
                      !isRaw &&
                      processValidation(
                        req,
                        res,
                        this._config,
                        routeFunction.validation
                      )
                    ) {
                      return;
                    }

                    routeFunction(req, res, this._handleNext, this._next);
                  }
                });
              } else {
                if (
                  !isRaw &&
                  processValidation(
                    req,
                    res,
                    this._config,
                    routeFunction.validation
                  )
                ) {
                  return;
                }

                routeFunction(req, res, this._handleNext, this._next);
              }
            }
          }
        }
      }
    }
  }
}

for (let i = 0, len = httpMethods.length; i < len; i++) {
  const method = httpMethods[i];
  Route.prototype[method] = function(path, schema, routeFunction, isRaw) {
    return this._addMethod(method, path, schema, routeFunction, isRaw);
  };
}
