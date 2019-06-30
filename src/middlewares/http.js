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
    asyncToSync,
    error
  } = prepareRouteFunctions(fns, app);

  if (error) {
    return config._notFoundHandler
      ? config._notFoundHandler
      : (res) =>
        res.end(
          '{"middleware_type":"sync","error":"The route handler not found"}'
        );
  }

  const handler = empty
    ? route
    : async (req, res, config) => {
      let middlewareChainingTransferPreviousResult;
      for (const fn of prepared) {
        if (fn.simple || !fn.async) {
          fn(req, res, config, middlewareChainingTransferPreviousResult);

          if (error && !middlewareChainingTransferPreviousResult) {
            if (error && !res.aborted) {
              if (config._errorHandler) {
                return config._errorHandler(error, req, res);
              }
              return res.end(
                `{"middleware_type":"sync",error":"${error.message}"}`
              );
            }
            return;
          }
        } else {
          const middleware = await fn(
            req,
            res,
            config,
            middlewareChainingTransferPreviousResult
          ).catch((error) => ({
            error
          }));

          if (middleware && middleware.error) {
            if (!res.aborted) {
              if (config._errorHandler) {
                return config._errorHandler(middleware.error, req, res);
              }
              return res.end(
                `{"middleware_type":"async",error":"${error.message}"}`
              );
            }
            return;
          }

          middlewareChainingTransferPreviousResult = middleware;
        }
      }

      if (method === 'options') {
        return undefined;
      }

      if (!route.async || route.simple) {
        route(req, res, config, middlewareChainingTransferPreviousResult);
        return;
      }

      return route(
        req,
        res,
        config,
        middlewareChainingTransferPreviousResult
      );
    };

  handler.async = empty ? route.async : allAsync;
  handler.simple = route.simple;
  handler.asyncToSync = asyncToSync;

  return http(path, handler, config, schema, ajv, method, app);
};
