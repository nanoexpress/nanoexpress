import { debug } from '../../../helpers/logs.js';

export default function modifyEnd() {
  if (!this._modifiedEnd) {
    const _oldEnd = this.end;

    this.end = function modifiedEnd(chunk, encoding) {
      let { _headers, statusCode, rawStatusCode, aborted, corked } = this;

      if (aborted) {
        return this;
      }

      if (!corked) {
        debug({
          message: 'cork is not called, call it first',
          file: 'modify-end.js',
          line: [15, 25],
          kind: 'handler',
          case: 'log',
          meta: {
            isCorked: corked,
            isAborted: aborted
          }
        });
        return;
      }

      // Polyfill for express-session and on-headers module
      if (!this.writeHead.notModified) {
        this.writeHead(statusCode || rawStatusCode, _headers);
        this.writeHead.notModified = true;
        _headers = this._headers;
      }

      if (typeof statusCode === 'number' && statusCode !== rawStatusCode) {
        this.status(statusCode);
        statusCode = this.statusCode;
      }
      const handler = () => {
        this.corked = true;

        if (_headers) {
          this.applyHeadersAndStatus();
        }
        if (statusCode && statusCode !== rawStatusCode) {
          this.writeStatus(statusCode);
        }

        return encoding
          ? _oldEnd.call(this, chunk, encoding)
          : _oldEnd.call(this, chunk);
      };

      return this.cork(handler);
    };

    this._modifiedEnd = true;
  }
  return this;
}
