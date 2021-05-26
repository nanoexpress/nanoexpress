import uWS from 'uWebSockets.js';
import { httpMethods } from './helpers/index.js';

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

  constructor(config, app, route) {
    this._config = config;
    this._app = app;
    this._route = route;

    this.time = Date.now();

    this._instance = null;

    if (config && config.swagger) {
      this.activateDocs();
    }

    this._routeCalled = false;
    this._optionsCalled = false;

    this._console = config.console || console;

    return this;
  }

  activateDocs() {
    this._app.get('/docs/swagger.json', (res) => {
      res.writeHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(this._config.swagger, null, 4));
    });
  }

  setErrorHandler(fn) {
    this._config._errorHandler = fn;

    return this;
  }

  setNotFoundHandler(fn) {
    this._config._notFoundHandler = fn;

    return this;
  }

  setValidationErrorHandler(fn) {
    this._config._validationErrorHandler = fn;

    return this;
  }

  use(...args) {
    this._route.use(...args);

    return this;
  }

  define(callback) {
    callback(this);

    return this;
  }

  ws(path, ...middlewares) {
    this._route.ws(path, ...middlewares);

    return this;
  }

  publish(topic, string, isBinary, compress) {
    return this._app.publish(topic, string, isBinary, compress);
  }

  listen(port, host) {
    const {
      _config: config,
      _app: app,
      _routeCalled,
      _optionsCalled,
      _console
    } = this;

    if (typeof port === 'string') {
      if (port.indexOf('.') !== -1) {
        const _host = host;

        host = port;
        port = _host || undefined;
      }
    }

    if (!_routeCalled) {
      const _errorContext = _console.error ? _console : console;

      _errorContext.error(
        'nanoexpress [Server]: None of middleware will be called until you define route'
      );
    }

    // Polyfill for plugins like CORS
    // Detaching it from every method for performance reason
    if (_routeCalled && !_optionsCalled) {
      this.options('/*', () => {});
    }

    if (!this._anyRouteCalled) {
      const notFoundHandler =
        config._notFoundHandler ||
        ((req, res) => {
          res.statusCode = 404;
          res.send({ code: 404, message: 'The route does not exist' });
        });
      notFoundHandler.handler = 2;
      this.get('/*', notFoundHandler);
    }

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
    const { _app, _route, _anyRouteCalled } = this;

    if (fns.length > 0) {
      const preparedRouteFunction = _route._prepareMethod(
        method.toUpperCase(),
        { path, originalUrl: path },
        ...fns
      );

      _app[method](path, preparedRouteFunction);

      this._routeCalled = true;

      if (!_anyRouteCalled && method !== 'options') {
        this._anyRouteCalled = path === '/*';
      }

      if (method === 'options') {
        this._optionsCalled = true;
      }
    }
    return this;
  };

for (let i = 0, len = httpMethods.length; i < len; i += 1) {
  const method = httpMethods[i];
  App.prototype[method] = exposeAppMethodHOC(method);
}
