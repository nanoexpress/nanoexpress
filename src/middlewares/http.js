import { http } from '../handler';
import { prepareRouteFunctions } from '../helpers';

export default (path = '/*', fns, config, ajv) => {
  if (typeof path === 'function') {
    fns.unshift(path);
    path = '/*';
  }

  const { route, prepared, empty, schema } = prepareRouteFunctions(fns);

  return http(
    path,
    empty
      ? route
      : async (req, res) => {
        for (const fn of prepared) {
          if (fn.sync) {
            fn(req, res, config);
          } else {
            const middleware = await fn(req, res, config);

            if (middleware && middleware.error) {
              if (!res.aborted) {
                return res.end('{"error":"' + middleware.message + '"}');
              }
              return undefined;
            }
          }
        }

        if (req.method === 'options') {
          return undefined;
        }
        if (!route.async) {
          route(req, res, config);
          return undefined;
        }

        return route(req, res, config);
      },
    config,
    schema,
    ajv
  );
};
