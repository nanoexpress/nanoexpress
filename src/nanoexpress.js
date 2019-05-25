import uWS from 'uWebSockets.js';

import { http } from './handler';

const nanoexpress = (options = {}) => {
  const time = Date.now(); // For better managing start-time / lags
  let app;

  if (options.https) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  return {
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
    use: async (path = '/*', ...fns) => {
      if (typeof path === 'function') {
        fns.unshift(path);
        path = '/*';
      }
      await app.all(
        path,
        http(async (req, res) => {
          for await (const fn of fns) {
            await fn(req, res);
          }
        })
      );
    },
    get: async (path, fn) => await app.get(path, http(path, fn)),
    post: async (path, fn) => await app.post(path, http(path, fn)),
    put: async (path, fn) => await app.put(path, http(path, fn)),
    patch: async (path, fn) => await app.get(path, http(path, fn)),
    head: async (path, fn) => await app.head(path, http(path, fn)),
    delete: async (path, fn) => await app.delete(path, http(path, fn)),
    options: async (path, fn) => await app.options(path, http(path, fn)),
    trace: async (path, fn) => await app.trace(path, http(path, fn)),
    any: async (path, fn) => await app.any(path, http(path, fn)),
    all: async (path, fn) => await app.all(path, http(path, fn))
  };
};

const myapp = nanoexpress();

myapp.get('/', async () => ({ status: 'success' }));
myapp.get('/:name/:app', async () => ({ status: 'param' }));
myapp.listen(4000);

export { nanoexpress as default };
