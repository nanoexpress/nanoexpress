import fastQueryParse from 'fast-query-parse';
import uWS from 'uWebSockets.js';
import FindRoute from './find-route.js';
import { httpMethods } from './helpers/index.js';
import { body, pipe, stream } from './request-proto/index.js';
import { HttpResponse } from './response-proto/index.js';
import Route from './Route.js';

export default class App {
  get config() {
    return this._config;
  }

  get host() {
    const { _config: config } = this;
    return config.host;
  }

  get port() {
    const { _config: config } = this;
    return config.port;
  }

  get address() {
    const { _config: config } = this;
    let address = '';
    if (config.host) {
      address += config.https ? 'https://' : 'http://';
      address += config.host || 'localhost';

      if (config.port) {
        address += `:${config.port}`;
      }
    }

    return address;
  }

  constructor(config, app) {
    this._config = config;
    this._app = app;
    this._router = new FindRoute(config);

    this._ws = [];
    this._pubs = [];

    this.time = Date.now();

    this._instance = null;

    this._console = config.console || console;

    return this;
  }

  setErrorHandler(fn) {
    this._config._errorHandler = fn;

    return this;
  }

  setNotFoundHandler(fn) {
    this._router.defaultRoute = fn;

    return this;
  }

  use(basePath, ...middlewares) {
    if (typeof basePath === 'function') {
      middlewares.unshift(basePath);
      basePath = '*';
    }
    middlewares.forEach((handler) => {
      if (handler instanceof Route) {
        const { _routers } = handler;
        _routers.forEach(({ method, path, handler: routeHandler }) => {
          const routePath =
            // eslint-disable-next-line no-nested-ternary
            basePath === '*' ? '*' : path === '/' ? basePath : basePath + path;
          this._router.on(method, routePath, routeHandler);
        });
        handler._app = this;
        handler._basePath = basePath;
        _routers.length = 0;
      } else {
        this._router.on(httpMethods, basePath, handler);
      }
    });

    return this;
  }

  define(callback) {
    callback(this);

    return this;
  }

  ws(path, handler, options) {
    this._ws.push({ path, handler, options });

    return this;
  }

  publish(topic, string, isBinary, compress) {
    this._pubs.push({ topic, string, isBinary, compress });

    return this;
  }

  listen(port, host) {
    const { _config: config, _app: app, _router: router, _console } = this;

    if (typeof port === 'string') {
      if (port.indexOf('.') !== -1) {
        const _host = host;

        host = port;
        port = _host || undefined;
      }
    }

    app.any('/*', async (res, req) => {
      req.url = req.getUrl();

      req.path = req.url;
      req.query = fastQueryParse(req.getQuery());
      req.method = req.getMethod().toUpperCase();

      const bodyAllowedMethod =
        req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';

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

      // Default HTTP Raw Status Code Integer
      res.rawStatusCode = 200;

      let headers;
      let aborted = false;
      req.forEach((key, value) => {
        if (!headers) {
          headers = {};
        }
        headers[key] = value;
      });
      if (headers) {
        req.headers = headers;
      }
      if (headers && headers.cookie) {
        req.cookies = fastQueryParse(req.headers.cookie);
      }
      if (
        req.headers &&
        ((bodyAllowedMethod && res.onData) ||
          req.headers['transfer-encoding'] ||
          (req.headers['content-length'] && +req.headers['content-length'] > 2))
      ) {
        res.onAborted(() => {
          aborted = true;
        });
        stream(req, res);
        req.pipe = pipe;
      }
      if (req.stream && !aborted) {
        await body(req);
      }

      if (
        aborted ||
        req.method === 'OPTIONS' ||
        res.stream === true ||
        res.stream === 1
      ) {
        return;
      }

      if (router.async && router.await) {
        if (!req.stream) {
          res.onAborted(() => {
            aborted = true;
          });
        }
        return router.lookup(req, res);
      }

      router.lookup(req, res);
    });

    return new Promise((resolve, reject) => {
      if (port === undefined) {
        const _errorContext = _console.error ? _console : console;

        _errorContext.error('[Server]: PORT is required');
        return undefined;
      }
      port = Number(port);

      const onListenHandler = (token) => {
        if (typeof host === 'string') {
          config.host = host;
        } else {
          config.host = 'localhost';
        }
        if (typeof port === 'number') {
          config.port = port;
        }

        if (token) {
          const _debugContext = _console.debug ? _console : console;

          this._instance = token;
          _debugContext.debug(
            `[Server]: started successfully at [${config.host}:${port}] in [${
              Date.now() - this.time
            }ms]`
          );
          resolve(this);
        } else {
          const _errorContext = _console.error ? _console : console;

          _errorContext.error(
            `[Server]: failed to host at [${config.host}:${port}]`
          );
          reject(
            new Error(`[Server]: failed to host at [${config.host}:${port}]`)
          );
          config.host = null;
          config.port = null;
        }
      };

      if (host) {
        app.listen(host, port, onListenHandler);
      } else {
        app.listen(port, onListenHandler);
      }
    });
  }

  close() {
    const { _config: config, _console } = this;

    if (this._instance) {
      const _debugContext = _console.debug ? _console : console;

      config.host = null;
      config.port = null;
      uWS.us_listen_socket_close(this._instance);
      this._instance = null;
      _debugContext.debug('[Server]: stopped successfully');
      return true;
    }
    const _errorContext = _console.error ? _console : console;

    _errorContext.error('[Server]: Error, failed while stopping');
    return false;
  }
}

const exposeAppMethodHOC = (method) =>
  function exposeAppMethod(path, ...fns) {
    fns.forEach((handler) => {
      this._router.on(method.toUpperCase(), path, handler);
    });
    return this;
  };

for (let i = 0, len = httpMethods.length; i < len; i += 1) {
  const method = httpMethods[i].toLocaleLowerCase();
  App.prototype[method] = exposeAppMethodHOC(method);
}
