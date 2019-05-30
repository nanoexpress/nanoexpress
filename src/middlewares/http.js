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
      ? route.fn
      : async (req, res) => {
        for (const fn of prepared) {
          if (fn.sync) {
            fn(req, res, config);
          } else {
            const middleware = await fn(req, res, config).catch((err) => {
              if (err) {
                if (err.message) {
                  res.end(
                    '{"error":"' + err.message.replace(/"/g, '\\"') + '"}'
                  );
                  return { error: true };
                } else {
                  console.log('[Server]: Error', err);
                  console.log('[Server]: At Middleware', fn.toString());
                }
              }
            });

            if (middleware && middleware.error) {
              return undefined;
            }
          }
        }

        if (req.method === 'options') {
          return undefined;
        }

        return route.isAsync
          ? await route.fn(req, res, config)
          : route.fn(req, res, config);
      },
    config,
    schema,
    ajv
  );
};
