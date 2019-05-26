import uWS from 'uWebSockets.js';

import { http, ws } from './middlewares';
import { routeMapper } from './helpers';
import { middlewares as builtinMiddlewares } from './builtins';

const nanoexpress = (options = {}) => {
  const time = Date.now(); // For better managing start-time / lags
  let app;

  if (options.https) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  // For Performance reason
  process.on('beforeExit', () => {
    app.forcefully_free();
  });

  const httpMethods = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'any',
    'head',
    'options',
    'trace'
  ];
  // App configuration
  let middlewares = [...builtinMiddlewares];
  const pathMiddlewares = {};
  const config = {};

  const _app = {
    config: {
      set: (key, value) => {
        config[key] = value;
      },
      get: (key) => config[key]
    },
    listen: (port, host) =>
      new Promise((resolve, reject) => {
        if (port === undefined) {
          console.log('[Server]: PORT is required');
          return;
        }
        app.listen(port, host, (token) => {
          if (token) {
            console.log(
              `[Server]: started successfully at [localhost:${port}] in [${Date.now() -
                time}ms]`
            );
            resolve();
          } else {
            console.log(`[Server]: failed to host at [localhost:${port}]`);
            reject();
          }
        });
      }),
    use: async (path, ...fns) => {
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
    },
    ws: (path, options, fn) => app.ws(path, ws(path, options, fn))
  };

  httpMethods.forEach((method) => {
    _app[method] = async (path, ...fns) =>
      await app[method](
        path,
        await http(
          path,
          middlewares.concat(pathMiddlewares[path] || []).concat(fns),
          config
        )
      );
  });

  _app.define = routeMapper(_app);

  return _app;
};

const app = nanoexpress();

app.ws(
  '/ws',
  { compression: 0, maxPayloadLength: 16 * 1024 * 1024, idleTimeout: 10 },
  (req, ws) => {
    console.log('connection established');
    ws.on('message', (msg) => console.log('message', msg));
    ws.on('drain', (amount) => console.log('drain', amount));
    ws.on('close', (code, msg) => console.log('closed', code, msg));

    ws.send('hello');
  }
);

app.get('/', () => 'hello');

app.listen(4000);

export { nanoexpress as default };
