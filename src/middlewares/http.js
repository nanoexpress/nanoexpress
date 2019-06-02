import { http } from '../handler';
import { prepareRouteFunctions } from '../helpers';

export default (path = '/*', fns, config, ajv) => {
  if (typeof path === 'function') {
    if (Array.isArray(fns)) {
      fns.unshift(path);
    } else if (!fns) {
      fns = path;
    }
    path = '/*';
  }

  const { route, prepared, empty, schema, error } = prepareRouteFunctions(fns);

  if (error) {
    return (res) => {
      res.end('{"error":"The route handler not found"}');
    };
  }

  const handler = empty
    ? route
    : async (req, res, config) => {
      for (const fn of prepared) {
        if (!fn.async) {
          fn(req, res, config);
        } else {
          const middleware = await fn(req, res, config);

          if (middleware && middleware.error) {
            if (!res.aborted) {
              return res.end('{"error":"' + middleware.message + '"}');
            }
            return;
          }
        }
      }

      if (req.method === 'options') {
        return undefined;
      }
      if (!route.async) {
        route(req, res, config);
        return;
      }

      return route(req, res, config);
    };
  handler.async = empty ? route.async : true;

  return [path, http(path, handler, config, schema, ajv)];
};
