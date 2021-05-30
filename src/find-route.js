import fastDecodeURI from 'fast-decode-uri-component';
import { pathToRegexp } from 'path-to-regexp';
import { invalid } from './helpers/index.js';

export default class FindRoute {
  constructor(options = {}) {
    this.options = options;
    this.routes = [];
    this.async = false;
    this.await = false;
    this.fetchParams = true;
    this.defaultRoute = null;
  }

  // eslint-disable-next-line class-methods-use-this
  shimLegacy(func) {
    return async (req, res) =>
      new Promise((resolve, reject) =>
        func(req, res, (err, done) => {
          if (err) {
            return reject(err);
          }
          return resolve(done);
        })
      );
  }

  // eslint-disable-next-line class-methods-use-this
  parse(route) {
    if (typeof route.path === 'string') {
      route.path = fastDecodeURI(route.path);
      if (route.path === '*' || route.path === '/*') {
        route.all = true;
      } else if (route.path.indexOf(':') !== -1) {
        route.fetch_params = true;
        route.params_id = [];
        route.path = pathToRegexp(route.path, route.params_id);
        route.regex = true;
      } else if (route.path.indexOf('*') !== -1) {
        route.params_id = [];
        route.path = pathToRegexp(route.path, route.params_id);
        route.fetch_params = route.params_id.length > 0;
        route.regex = true;
      }
    } else if (route.path instanceof RegExp) {
      route.regex = true;
    }
    route.async = route.handler.constructor.name === 'AsyncFunction';
    route.await = route.handler.toString().includes('await');
    route.legacy = route.handler.toString().includes('next(');

    if (!route.async && !route.legacy) {
      invalid(
        'nanoexpress: Route or Middleware should be either async or legacy mode (express middleware like)'
      );
    }
    if (!this.async && route.async) {
      this.async = true;
    }
    if (!this.await && route.await) {
      this.await = true;
    }
    if (route.legacy) {
      route.handler = this.shimLegacy(route.handler);
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
          if (route.async || route.legacy) {
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
