import http from 'http';
import { sendFile } from '../../helpers';
import jsonStrify from 'json-strify';

const HttpResponse = {
  // Normalize status method
  status(code) {
    if (http.STATUS_CODES[code] !== undefined) {
      this.writeStatus(code + ' ' + http.STATUS_CODES[code]);
    } else {
      console.error('[Server]: Invalid Code ' + code);
    }

    return this;
  },

  // Normalize setHeader method
  setHeader(key, value) {
    if (!this._headers) {
      this._headers = {};
      this._headersCount = 0;
    }
    this._headersCount++;
    this._headers[key] = value;

    return this;
  },

  // Normalize hasHeader method
  hasHeader(key) {
    return !!this._headers && this._headers[key] !== undefined;
  },

  // Normalize removeHeader
  removeHeader(key) {
    if (!this._headers) {
      return;
    }
    delete this._headers[key];
    this._headersCount--;

    if (this._headersCount === 0) {
      this._headers = null;
      delete this._headers;
    }

    return this;
  },

  // For rare some cases
  applyHeaders() {
    const { _headers, _headersCount } = this;
    if (_headersCount) {
      for (const header in _headers) {
        this.writeHeader(header, _headers[header]);
        this.removeHeader(header);
      }
    }

    return this;
  },
  setHeaders(headers) {
    for (const header in headers) {
      this.writeHeader(header, headers[header]);
    }

    return this;
  },
  writeHead(code, headers) {
    this.status(code);
    this.applyHeaders();
    this.setHeaders(headers);

    return this;
  },

  // Normalise send method
  // And some features, like
  // HTML, JSON, XML and Plain
  // parsing out-of-the-box
  send(result) {
    const { schema } = this;

    /* If we were aborted, you cannot respond */
    if (!result || this.aborted) {
      console.error(
        '[Server]: Error, Response was aborted before responsing or result is marlformed'
      );
      return;
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
    this.applyHeaders();
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

export default HttpResponse;
