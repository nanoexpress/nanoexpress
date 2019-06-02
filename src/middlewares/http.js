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

  const { route, prepared, empty, schema, error } = prepareRouteFunctions(
    fns,
    app
  );

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
          fn.call(app, req, res, config);
        } else {
          const middleware = await fn.call(app, req, res, config);

          if (middleware && middleware.error) {
            if (!res.aborted) {
              return res.end('{"error":"' + middleware.message + '"}');
            }
            return;
          }
        }
      }

      if (method === 'options') {
        return undefined;
      }
      if (!route.async) {
        route(req, res, config);
        return;
      }

      return route(req, res, config);
    };
  handler.async = empty ? route.async : true;

  return [path, http(path, handler, config, schema, ajv, method, app)];
};
