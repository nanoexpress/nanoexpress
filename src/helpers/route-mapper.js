// Constants
const appMethods = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
  'trace',
  'any',
  'ws'
];

// Utils
const pathKeyNormalizer = (path) =>
  path.includes('{') ? path.replace(/\{(.*)\}/g, ':$1') : path;

export default (app) => async (routes) => {
  (function normalizeRoutes(path, appRoutes, route = false) {
    if (appRoutes.normalized) {
      return;
    }
    if (route && path) {
      routes[path] = appRoutes;
      return;
    }
    for (const key in appRoutes) {
      const value = appRoutes[key];
      const keysOfValue = value && Object.keys(value);
      const normalisedKey = pathKeyNormalizer(key);

      if (
        path === '/' &&
        keysOfValue.every((key) => appMethods.includes(key))
      ) {
        for (const method in value) {
          const routeCallback = value[method];
          value[method] =
            typeof routeCallback === 'function'
              ? { callback: routeCallback }
              : routeCallback;
        }

        normalizeRoutes(path, value, true);
      } else if (
        keysOfValue.every((key) => !appMethods.includes(key)) &&
        (!path || path === '/' || key.startsWith('/'))
      ) {
        if (path === normalisedKey) {
          path = '';
        } else if ((path + normalisedKey).startsWith('//')) {
          path = '';
        }

        for (const route in value) {
          normalizeRoutes(path + normalisedKey + route, value[route]);
        }

        delete appRoutes[key];
      } else if (
        keysOfValue &&
        keysOfValue.every((key) => appMethods.includes(key))
      ) {
        const route = routes[path];
        const normalisedValue =
          typeof value === 'function' ? { callback: value } : value;

        if (route) {
          route[key] = normalisedValue;
        } else {
          routes[path] = {
            [key]: normalisedValue
          };
        }
      } else if (
        keysOfValue &&
        keysOfValue.some((key) => appMethods.includes(key))
      ) {
        for (const method in value) {
          if (appMethods.includes(method)) {
            if (!value[method].callback) {
              value[method] = { callback: value };
            }
          } else {
            let normalisedPath = method;
            if (method.startsWith('/') && path.endsWith('/')) {
              normalisedPath = method.substr(1);
            }
            normalizeRoutes(path + normalisedPath, value[method]);
            delete value[method];
          }
        }
      } else {
        console.error(
          `[Server]: The Schema of _*${path}*_ ` +
            'is missing, please add schema!)'
        );
      }
    }
  })('/', routes, false);

  // This prevents from N+1 normalize
  routes.normalized = true;

  for (const path in routes) {
    const route = routes[path];
    const methods = Object.keys(route);

    if (route) {
      for await (const method of methods) {
        const { callback, middlewares = [] } = route[method];

        middlewares.push(callback);

        await app[method](path, ...middlewares);
      }
    }
  }
  return app;
};
