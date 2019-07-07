import isSimpleHandler from './is-simple-handler';

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
  const asyncToSync = fns.find((fn) => fn.asyncToSync !== undefined);

  const prepared = fns
    .map((fn, index) => {
      let result;
      if (!fn || typeof fn === 'object') {
        return null;
      }
      const { simple, handler } = isSimpleHandler(fn, false);

      if (simple) {
        handler.simple = simple;
        handler.async = false;
        return handler;
      } else if (fn.then || fn.constructor.name === 'AsyncFunction') {
        result = fn;
        result.async = true;
      } else if (
        index === fns.length - 1 &&
        fn.toString().indexOf('next)') === -1 &&
        fn.toString().indexOf('async') === -1
      ) {
        result = fn;
        result.async = false;
      } else {
        result = (req, res, config, prevValue) =>
          new Promise((resolve) =>
            fn(
              req,
              res,
              (error, done) => {
                if (error) {
                  return resolve({ error });
                }
                resolve(done);
              },
              config,
              prevValue
            )
          );
        result.async = true;
      }

      result.simple = false;
      return result;
    })
    .filter((fn) => fn);

  const allAsync = prepared.some((fn) => fn.async);
  const route = prepared.pop();

  return {
    prepared,
    empty: prepared.length === 0,
    schema,
    route,
    allAsync,
    asyncToSync
  };
};
