import { http } from '../handler';
import { prepareRouteFunctions } from '../helpers';

export default (path = '/*', fns, config) => {
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
            await fn(req, res, config);
          }
        }

        return route.isAsync
          ? await route.fn(req, res, config)
          : route.fn(req, res, config);
      },
    config,
    schema
  );
};
