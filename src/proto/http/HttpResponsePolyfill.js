import http from 'http';

const HttpResponsePolyfill = {
  // Normalize status method
  status(code) {
    this.modifyEnd();
    if (typeof this.statusCode === 'string') {
      return this;
    }
    if (http.STATUS_CODES[code] !== undefined) {
      this.statusCode = code + ' ' + http.STATUS_CODES[code];
    } else {
      console.error('[Server]: Invalid Code ' + code);
    }

    return this;
  },
  writeHead(code, headers) {
    if (typeof code === 'object' && !headers) {
      headers = code;
      code = this.statusCode || 200;
    }

    this.status(code);
    this.setHeaders(headers);

    return this;
  },

  // Redirect method
  redirect(code = 301, path) {
    const { __request, config } = this;
    const { headers } = __request;
    const { host } = headers;

    const httpHost = (config && config.host) || host;

    if (typeof code === 'string') {
      path = code;
      code = 301;
    }

    if (!path.startsWith('http')) {
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      path = config && config.https ? 'https://' : 'http://' + httpHost + path;
    }

    this.statusCode = code;
    this.writeHead({ Location: path });
    this.end();
    this.aborted = true;

    return this;
  }
};

export default HttpResponsePolyfill;
