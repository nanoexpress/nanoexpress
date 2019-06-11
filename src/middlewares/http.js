import { http } from '../handler';
import { prepareRouteFunctions } from '../helpers';

export default (path = '/*', fns, config, ajv, method, app) => {
  if (typeof path === 'function') {
    if (Array.isArray(fns)) {
      fns.unshift(path);
    } else if (!fns) {
      fns = path;
    }
    path = '/*';
  }

  const {
    route,
    prepared,
    empty,
    schema,
    allAsync,
    error,
    isNext,
    isError
  } = prepareRouteFunctions(fns, app);

  if (error) {
    return (res) =>
      res.end(
        '{"middleware_type":"sync","error":"The route handler not found"}'
      );
  }

  const handler = empty
    ? route
    : async (req, res, config) => {
      for (const fn of prepared) {
        if (fn.simple || !fn.async) {
          fn(req, res, config);

          const error = isError();
          if (!isNext() || error) {
            if (error && !res.aborted) {
              return res.end(
                `{"middleware_type":"sync",error":"${error.message}"}`
              );
            }
            return;
          }
        } else {
          const middleware = await fn(req, res, config);

          if (middleware && middleware.error) {
            if (!res.aborted) {
              return res.end(
                `{"middleware_type":"async",error":"${error.message}"}`
              );
            }
            return;
          }
        }
      }

      if (method === 'options') {
        return undefined;
      }

      if (!route.async || route.simple) {
        route(req, res, config);
        return;
      }

      return route(req, res, config);
    };

  handler.async = empty ? route.async : allAsync;
  handler.simple = route.simple;

  return http(path, handler, config, schema, ajv, method, app);
};
