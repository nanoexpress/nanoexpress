import { http } from '../handler';

export default async (path = '/*', fns, config) => {
  if (typeof path === 'function') {
    fns.unshift(path);
    path = '/*';
  }
  return (req, res) =>
    http(
      path,
      async (req, res) => {
        let result;
        for await (let fn of fns) {
          // Add Express-like middlewares support
          if (
            typeof fn === 'function' &&
            !fn.then &&
            fn.constructor.name !== 'AsyncFunction'
          ) {
            const syncFn = fn;
            fn = (req, res, config) =>
              new Promise((resolve, reject) => {
                const next = (err, done) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(done);
                  }
                };
                syncFn(req, res, next, config);
              });
          }
          result = await fn(req, res, config).catch((err) => {
            console.error(
              '[Server]: Error - Middleware crashed or failed',
              err
            );
          });
        }
        if (result === undefined || result === null) {
          result = '[Server]: Error - Response not found';
        }
        return result;
      },
      config
    )(req, res);
};
