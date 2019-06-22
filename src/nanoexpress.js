import uWS from 'uWebSockets.js';
import Ajv from 'ajv';

import fs from 'fs';
import { resolve } from 'path';

import { getMime, sendFile } from './helpers/sifrr-server';

import { http, ws } from './middlewares';
import { routeMapper } from './helpers';

const nanoexpress = (options = {}) => {
  const time = Date.now(); // For better managing start-time / lags
  let app;
  let ajv;

  if (options.https) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  const httpMethods = [
    'get',
    'post',
    'put',
    'patch',
    'del',
    'any',
    'head',
    'options',
    'trace'
  ];
  // App configuration
  let middlewares = [];
  const pathMiddlewares = {};
  const config = {
    host: null,
    port: null
  };

  config.https = !!options.https;

  config.setAjv = () => {
    ajv = new Ajv(options.ajv);
    if (options.configureAjv) {
      ajv = options.configureAjv(ajv);
    }
    config.ajv = ajv;
  };

  const _app = {
    config: {
      set: (key, value) => {
        config[key] = value;
      },
      get: (key) => config[key]
    },
    get host() {
      return config.host;
    },
    get port() {
      return config.port;
    },
    get address() {
      let address = '';
      if (config.host) {
        address += config.https ? 'https://' : 'http://';
        address += config.host;
        address += ':' + config.port;
      }

      return address;
    },
    listen: (port, host) =>
      new Promise((resolve, reject) => {
        if (port === undefined) {
          console.log('[Server]: PORT is required');
          return undefined;
        }
        app.listen(port, host, (token) => {
          if (token) {
            _app._instance = token;
            if (typeof host === 'string') {
              config.host = host;
            } else {
              config.host = 'localhost';
            }
            if (typeof port === 'number') {
              config.port = port;
            }
            console.log(
              `[Server]: started successfully at [localhost:${port}] in [${Date.now() -
                time}ms]`
            );
            resolve(_app);
          } else {
            config.host = null;
            config.port = null;
            console.log(`[Server]: failed to host at [localhost:${port}]`);
            reject();
          }
        });
      }),
    close: () => {
      if (_app._instance) {
        config.host = null;
        config.port = null;
        app.us_listen_socket_close(_app._instance);
        console.log('[Server]: stopped successfully');
        return true;
      } else {
        console.log('[Server]: Error, failed while stopping');
        return false;
      }
    },
    setErrorHandler: (fn) => {
      config._errorHandler = fn;
      return _app;
    },
    setNotFoundHandler: (fn) => {
      config._notFoundHandler = fn;
      return _app;
    },
    use: (path, ...fns) => {
      if (typeof path === 'function') {
        fns.unshift(path);
        middlewares.push(...fns);

        // Avoid duplicates if contains for performance
        middlewares = middlewares.filter(
          (item, i, self) => self.indexOf(item) === i
        );
      } else if (typeof path === 'string') {
        if (!pathMiddlewares[path]) {
          pathMiddlewares[path] = [];
        }

        // Avoid duplicates if contains for performance
        pathMiddlewares[path].push(...fns);
        pathMiddlewares[path] = pathMiddlewares[path].filter(
          (item, i, self) => self.indexOf(item) === i
        );
      }
      return _app;
    },
    ws: (path, options, fn) => {
      app.ws(path, options && options.isRaw ? fn : ws(path, options, fn));
      return _app;
    },
    static: (
      route,
      path,
      { index = 'index.html', addPrettyUrl = true, streamConfig } = {}
    ) => {
      const staticFilesPath = fs.readdirSync(path);

      for (const fileName of staticFilesPath) {
        const isStreamableResource = getMime(fileName);

        const pathNormalisedFileName = resolve(path, fileName);
        const routeNormalised = route + fileName;

        const handler = (res, req) => {
          if (res.__streaming || res.__called) {
            return;
          }
          if (isStreamableResource) {
            sendFile(res, req, pathNormalisedFileName, streamConfig);
            res.__streaming = true;
          } else {
            const sendFile = fs.readFileSync(pathNormalisedFileName, 'utf-8');
            res.end(sendFile);
            res.__called = true;
          }
        };
        if (addPrettyUrl && fileName === index) {
          app.get(route, handler);
        }

        app.get(routeNormalised, handler);
      }
    }
  };

  httpMethods.forEach((method) => {
    _app[method] = (path, ...fns) => {
      if (fns.length > 0) {
        const isRaw = fns.find((fn) => fn.isRaw === true);

        if (isRaw) {
          const fn = fns.pop();
          return app[method](path, (res, req) => fn(req, res));
        }
      }
      const handler = http(
        path,
        middlewares.concat(pathMiddlewares[path] || []).concat(fns),
        config,
        ajv,
        method,
        app
      );
      app[method](
        typeof path === 'string' ? path : '/*',
        typeof path === 'function' && !handler ? path : handler
      );
      return _app;
    };
  });

  _app.define = routeMapper(_app);

  return _app;
};

export { nanoexpress as default };
