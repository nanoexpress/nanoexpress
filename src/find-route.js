import { prepareParams } from './helpers/index.js';

export default class FindRoute {
  constructor(options = {}) {
    this.options = options;
    this.routes = [];
    this.async = false;
    this.await = false;
    this.defaultRoute = null;
  }

  // eslint-disable-next-line class-methods-use-this
  parse(route) {
    if (typeof route.path === 'string') {
      if (route.path === '*' || route.path === '/*') {
        route.all = true;
      }
      if (route.path.indexOf(':') !== -1) {
        route.fetch_params = true;
        route.params_id = prepareParams(route.path);
        route.params_id.forEach((key) => {
          route.path = route.path.replace(`:${key}`, '([^/]+?)');
        });
        // eslint-disable-next-line security-node/non-literal-reg-expr
        route.path = new RegExp(`^${route.path}\\/?$`, 'i');
        route.regex = true;
      } else if (route.path.indexOf('*') !== -1) {
        route.path = new RegExp(
          // eslint-disable-next-line security-node/non-literal-reg-expr
          `^${route.path.replace(/\*/g, '(.*)')}\\/?$`,
          'i'
        );
        route.regex = true;
      }
    } else if (route.path instanceof RegExp) {
      route.regex = true;
    }
    route.async = route.handler.constructor.name === 'AsyncFunction';
    route.await = route.toString().includes('await');

    if (!this.async && route.async) {
      this.async = true;
    }
    if (!this.await && route.await) {
      this.await = true;
    }
    return route;
  }

  on(method, path, handler) {
    if (Array.isArray(method)) {
      method.forEach((methodId) => {
        this.on(methodId, path, handler);
      });
      return this;
    }
    if (Array.isArray(path)) {
      path.forEach((pathId) => {
        this.on(method, pathId, handler);
      });
      return this;
    }
    if (Array.isArray(handler)) {
      handler.forEach((handlerId) => {
        this.on(method, path, handlerId);
      });
      return this;
    }

    this.routes.push(this.parse({ method, path, handler }));

    return this;
  }

  find(method, path, handlers = []) {
    const { routes } = this;

    for (let i = 0, len = routes.length; i < len; i += 1) {
      const route = routes[i];

      if (route.method === method) {
        if (route.regex && route.path.test(path)) {
          handlers.push(route.handler);
        } else if (route.path === path) {
          handlers.push(route.handler);
        }
      }
    }
    return handlers;
  }

  async lookup(req, res) {
    const { routes } = this;
    let response;

    for (let i = 0, len = routes.length; i < len; i += 1) {
      const route = routes[i];

      if (route.method === 'ANY' || route.method === req.method) {
        let found = false;
        if (route.all) {
          found = true;
        } else if (route.regex && route.path.test(req.path)) {
          found = true;
        } else if (route.path === req.path) {
          found = true;
        }

        if (found) {
          if (route.fetch_params) {
            const exec = route.path.exec(req.path);
            req.params = {};

            for (let p = 0, lenp = route.params_id.length; p < lenp; p += 1) {
              const key = route.params_id[p];
              const value = exec[p + 1];

              req.params[key] = value;
            }
          }
          if (route.async) {
            // eslint-disable-next-line no-await-in-loop
            response = await route.handler(req, res);
          } else {
            response = route.handler(req, res);
          }

          if (response !== undefined && response !== res) {
            res.end(JSON.stringify(response));
            break;
          } else if (response === res) {
            break;
          }
        }
      }
    }

    if (response === undefined && this.defaultRoute) {
      return this.defaultRoute(req, res);
    }

    return response;
  }
}
