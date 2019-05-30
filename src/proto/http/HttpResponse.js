import http from 'http';
import { sendFile } from '../../helpers';
import jsonStrify from 'json-strify';
import HttpCookieResponse from './HttpCookieResponse';

const HttpResponse = {
  modifyEnd() {
    if (!this._modifiedEnd) {
      const _oldEnd = this.end;

      this.end = function(chunk, encoding) {
        this.writeHead(this.statusCode || 200, this._headers);
        this.applyHeaders();
        return _oldEnd.call(this, chunk, encoding);
      };

      this._modifiedEnd = true;
    }
    return this;
  },

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

  // Normalize setHeader method
  setHeader(key, value) {
    this.modifyEnd();

    if (!this._headers) {
      this._headers = {};
      this._headersCount = 0;
    }
    this._headersCount++;
    this._headers[key] = value;
    return this;
  },

  // Normalize getHeader method
  getHeader(key) {
    return !!this._headers && !!key && this._headers[key];
  },

  // Normalize hasHeader method
  hasHeader(key) {
    return (
      !!this._headers &&
      this._headers[key] !== undefined &&
      this._headers[key] !== null
    );
  },

  // Normalize removeHeader
  removeHeader(key) {
    if (!this._headers || !this._headers[key]) {
      return undefined;
    }
    this.modifyEnd();
    this._headers[key] = null;
    this._headersCount--;

    return this;
  },

  // For rare some cases
  applyHeaders() {
    const { _headers, _headersCount } = this;
    if (_headersCount > 0) {
      for (const header in _headers) {
        const value = _headers[header];

        if (value !== undefined && value !== null) {
          if (value.splice && value.length) {
            for (let i = 0, len = value.length; i < len; i++) {
              this.writeHeader(header, value[i]);
            }
          } else {
            this.writeHeader(header, _headers[header]);
          }
          this.removeHeader(header);
        }
      }
    }

    return this;
  },
  setHeaders(headers) {
    for (const header in headers) {
      if (this._headers) {
        const currentHeader = this._headers[header];
        if (currentHeader !== undefined || currentHeader !== null) {
          continue;
        }
      }
      this.setHeader(header, headers[header]);
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
  },

  // Normalise send method
  // And some features, like
  // HTML, JSON, XML and Plain
  // parsing out-of-the-box
  send(result) {
    const { schema } = this;

    /* If we were aborted, you cannot respond */
    if (this.aborted) {
      console.error('[Server]: Error, Response was aborted before responsing');
      return undefined;
    }
    if (!result || this.aborted) {
      console.error('[Server]: Error, Response result is marlformed');
      return undefined;
    }
    if (typeof result === 'string') {
      if (result.indexOf('<!DOCTYPE') === 0) {
        this.setHeader('Content-Type', 'text/html');
      } else if (result.indexOf('<xml') === 0) {
        this.setHeader('Content-Type', 'application/xml');
      }
    } else if (typeof result === 'object') {
      this.setHeader('Content-Type', 'application/json');
      if (schema) {
        result = schema(result);
      } else {
        result = jsonStrify(result);
      }
    }
    if (this.statusCode) {
      this.modifyEnd();
    }
    this.end(result);

    return this;
  },

  // It boosts performance by large-margin
  // if you use it right :)
  cork(result) {
    this.experimental_cork
      ? (result) =>
        this.experimental_cork(() => {
          this.send(result);
        })
      : this.send(result);

    return this;
  }
};

// Aliases for beginners and/or users from Express!
HttpResponse.json = HttpResponse.send;
HttpResponse.xml = HttpResponse.send;
HttpResponse.html = HttpResponse.send;
HttpResponse.plain = HttpResponse.send;

// Add stream feature by just method
// for easy and clean code
HttpResponse.sendFile = sendFile;

// Extending the cookie
Object.assign(HttpResponse, HttpCookieResponse);

export default HttpResponse;
