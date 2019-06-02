export default (fns) => {
  if (Array.isArray(fns)) {
    if (fns.length === 0) {
      return { empty: true, error: true };
    }
  } else if (typeof fns === 'function') {
    const async = fns.then || fns.constructor.name === 'AsyncFunction';
    fns.async = async;

    return { route: fns, empty: true };
  }
  const schema = fns.find((fn) => fn.schema);

  const prepared = fns
    .map((fn, index) => {
      let result;
      if (!fn || (typeof fn === 'object' && fn.schema)) {
        return null;
      }
      if (fn.then || fn.constructor.name === 'AsyncFunction') {
        result = fn;
        result.async = true;
      } else if (
        index === fns.length - 1 &&
        fn.toString().indexOf('next)') === -1
      ) {
        result = fn;
        result.async = false;
      } else {
        result = (req, res, config) =>
          new Promise((resolve) => {
            const next = (err, done) => {
              if (err) {
                err.error = true;
                return resolve(err);
              } else {
                resolve(done);
              }
            };
            fn(req, res, next, config);
          });
        result.async = true;
      }
      return result;
    })
    .filter((fn) => fn);

  const route = prepared.pop();

  return {
    prepared,
    empty: prepared.length === 0,
    schema,
    route
  };
};
