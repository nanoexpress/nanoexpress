const { serialize } = require('cookie');

const HttpCookieResponse = {
  setCookie(name, value, options) {
    if (options.expires && Number.isInteger(options.expires)) {
      options.expires = new Date(options.expires);
    }
    const serialized = serialize(name, value, options);

    let setCookie = this.getHeader('Set-Cookie');

    if (!setCookie) {
      this.setHeader('Set-Cookie', serialized);
      return undefined;
    }

    if (typeof setCookie === 'string') {
      setCookie = [setCookie];
    }

    setCookie.push(serialized);

    this.removeHeader('Set-Cookie');
    this.setHeader('Set-Cookie', setCookie);
    return this;
  },
  hasCookie(name) {
    const req = this.__request;
    return !!req && !!req.cookies && req.cookies[name] !== undefined;
  },
  removeCookie(name, options = {}) {
    const currTime = Date.now();
    if (!options.expires || options.expires >= currTime) {
      options.expires = currTime - 1000;
    }
    this.setCookie(name, '', options);
    return this;
  }
};

// Alias for Express users
HttpCookieResponse.cookie = HttpCookieResponse.setCookie;

export default HttpCookieResponse;
