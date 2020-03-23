export default function modifyEnd() {
  if (!this._modifiedEnd) {
    const _oldEnd = this.end;

    this.end = function (chunk, encoding) {
      // eslint-disable-next-line prefer-const
      let { _headers, statusCode, rawStatusCode } = this;

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
      if (_headers) {
        if (statusCode && statusCode !== rawStatusCode) {
          this.writeStatus(statusCode);
        }

        this.applyHeadersAndStatus();
      } else if (statusCode && statusCode !== rawStatusCode) {
        this.writeStatus(statusCode);
      }

      return encoding
        ? _oldEnd.call(this, chunk, encoding)
        : _oldEnd.call(this, chunk);
    };

    this._modifiedEnd = true;
  }
  return this;
}
