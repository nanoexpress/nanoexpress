export default (fns) => {
  if (fns.length === 0) {
    return {};
  }
  // Fetch last function as Route

  const routeFn = fns.pop();
  const isRouteAsync =
    routeFn.then || routeFn.constructor.name === 'AsyncFunction';

  const schema = fns.find((fn) => fn.schema);

  const prepared = fns
    .map((fn) => {
      let result;
      if (typeof fn === 'object' && fn.schema) {
        return null;
      }
      if (typeof fn === 'function') {
        if (fn.then || fn.constructor.name === 'AsyncFunction') {
          if (fn.catch) {
            fn.catch((err) =>
              console.error(
                '[Server]: Error - Middleware crashed or failed',
                err
              )
            );
          }
          result = fn;
        } else {
          result = (req, res, config) =>
            new Promise((resolve, reject) => {
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
      return result;
    })
    .filter((fn) => fn);

  return {
    prepared,
    empty: prepared.length === 0,
    schema,
    route: {
      fn: routeFn,
      isAsync: isRouteAsync
    }
  };
};
