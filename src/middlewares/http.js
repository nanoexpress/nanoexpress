import { http } from '../handler';

export default (path = '/*', fns, config) => {
  if (typeof path === 'function') {
    fns.unshift(path);
    path = '/*';
  }
  const lastFn = fns[fns.length - 1];
  const len = fns.length;
  const schema = fns.find((fn) => fn.schema);
  return http(
    path,
    async (req, res) => {
      let result;
      let fn;
      let i = 0;
      for (; i < len; i++) {
        fn = fns[i];

        // If Schema was passed, we continue it for performance reason
        if (typeof fn === 'object' && fn.schema) {
          continue;
        }

        // Add Express-like middlewares support
        if (typeof fn === 'function') {
          if (fn.then || fn.constructor.name === 'AsyncFunction') {
            result = await fn(req, res, config).catch((err) => {
              console.error(
                '[Server]: Error - Middleware crashed or failed',
                err
              );
            });
          } else {
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
          }
        }
      }
      if (result === undefined || result === null) {
        result = '[Server]: Error - Response not found';
      }
      return result;
    },
    config,
    schema
  );
};
