import uWS from 'uWebSockets.js';

import { http } from './middlewares';

const nanoexpress = (options = {}) => {
  const time = Date.now(); // For better managing start-time / lags
  let app;

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
    'delete',
    'any',
    'head',
    'options',
    'trace'
  ];
  // App configuration
  let middlewares = [];
  const config = {};

  const _app = {
    set: (key, value) => {
      config[key] = value;
    },
    get: (key) => config[key],
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
    use: async (...fns) => {
      middlewares = fns;
    }
  };

  httpMethods.forEach((method) => {
    _app[method] = async (path, ...fns) =>
      await app[method](
        path,
        await http(path, middlewares.concat(fns), config)
      );
  });

  return _app;
};

const myapp = nanoexpress();

myapp.use((req, res, next) => {
  req.say = 'hello';
  next();
});
myapp.get('/', async () => ({ status: 'success' }));
myapp.get('/:name/:app', async (req) => ({ status: 'param', say: req.say }));
myapp.listen(4000);

export { nanoexpress as default };
