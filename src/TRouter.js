class TRoutes {
  constructor(options = {}) {
    this.options = options;
    this._routes = [];
  }

  on(methods, path, handler) {
    if (typeof methods === 'string') {
      methods = [methods];
    }

    methods.forEach((method) => {
      this._routes.push({
        method: method.toUpperCase(),
        path,
        handler,
        all: path === '*' || path === '/*'
      });
    });

    return this;
  }

  all(path, handler) {
    return this.on(['get', 'post', 'put', 'delete'], path, handler);
  }

  lookup(req, res) {
    if (this.options.ignoreTrailingSlash) {
      req.path = req.path.substr(0, req.path.length - 1);
    }
    let found = false;
    for (const route of this._routes) {
      if (route.method === req.method) {
        if (route.all) {
          found = route.handler(req, res);
        } else if (Array.isArray(route.path) && route.path.includes(req.path)) {
          found = route.handler(req, res);
        } else if (typeof route.path === 'string' && route.path === req.path) {
          found = route.handler(req, res);
        }
      }
    }
    if (found !== false) {
      return undefined;
    }
    return false;
  }
}

export default TRoutes;
