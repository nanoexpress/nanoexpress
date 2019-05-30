import { sendFile } from '../../helpers';
import jsonStrify from 'json-strify';
import HttpCookieResponse from './HttpCookieResponse';
import HttpHeaderResponse from './HttpHeaderResponse';
import HttpResponsePolyfill from './HttpResponsePolyfill';

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

  // Normalise send method
  // And some features, like
  // HTML, JSON, XML and Plain
  // parsing out-of-the-box
  send(result) {
    /* If we were aborted, you cannot respond */
    if (!result || this.aborted) {
      console.error(
        '[Server]: Error, Response was ' +
          (!result ? 'marlformed' : 'aborted before responsing')
      );
      return undefined;
    }
    if (typeof result === 'object') {
      this.setHeader('Content-Type', 'application/json');
      result = this.schema ? this.schema(result) : jsonStrify(result);
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

// Extending the header method
Object.assign(HttpResponse, HttpHeaderResponse);

// Polyfill some methods
Object.assign(HttpResponse, HttpResponsePolyfill);

export default HttpResponse;
