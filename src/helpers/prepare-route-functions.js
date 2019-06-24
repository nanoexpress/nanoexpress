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

  let next = false;
  let error = { message: 'Inside middleware `next` does not called' };

  const isNext = () => next;
  const isError = () => error;

  const nextHandler = (err, done = true) => {
    if (err) {
      error = err;
      next = false;
    } else {
      error = null;
      next = done;
    }
  };

  const prepared = fns
    .map((fn, index) => {
      let result;
      if (!fn || typeof fn === 'object') {
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
        result = (req, res, config, prevValue) =>
          fn(req, res, nextHandler, config, prevValue);
        result.async = false;
      }

      const { simple, handler } = isSimpleHandler(result, false);

      if (simple) {
        handler.simple = simple;
        handler.async = false;
        return handler;
      }

      result.simple = false;
      return result;
    })
    .filter((fn) => fn);

  const allAsync = prepared.some((fn) => fn.async);
  const route = prepared.pop();

  return {
    prepared,
    isNext,
    isError,
    empty: prepared.length === 0,
    schema,
    route,
    allAsync,
    asyncToSync
  };
};
