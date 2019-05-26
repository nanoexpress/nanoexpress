import { http } from '../handler';

export default (path = '/*', fns, config) => {
  if (typeof path === 'function') {
    fns.unshift(path);
    path = '/*';
  }
  const lastFn = fns[fns.length - 1];
  return http(
    path,
    async (req, res) => {
      let result;
      for await (const fn of fns) {
        // Add Express-like middlewares support
        if (typeof fn === 'function') {
          if (!fn.then && fn.constructor.name !== 'AsyncFunction') {
            if (fn === lastFn) {
              result = fn(req, res, config);
            } else {
              result = await new Promise((resolve, reject) => {
                const next = (err, done) => {
                  if (err) {
                    console.error(
                      '[Server]: Error - Middleware crashed or failed',
                      err
                    );
                    reject(err);
                  } else {
                    resolve(done);
                  }
                };
                fn(req, res, next, config);
              });
            }
          } else if (fn.then || fn.constructor.name === 'AsyncFunction') {
            result = await fn(req, res, config).catch((err) => {
              console.error(
                '[Server]: Error - Middleware crashed or failed',
                err
              );
            });
          }
        }
      }
      if (result === undefined || result === null) {
        result = '[Server]: Error - Response not found';
      }
      return result;
    },
    config
  );
};
