export default function modifyEnd() {
  if (!this._modifiedEnd) {
    const _oldEnd = this.end;

    this.end = function modifiedEnd(chunk, encoding) {
      let { _headers, statusCode, rawStatusCode, aborted, corks } = this;

      if (aborted) {
        return this;
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
      corks.push(() => {
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
      });
    };

    this._modifiedEnd = true;
  }
  return this;
}
