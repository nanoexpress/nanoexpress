export default function modifyEnd() {
  if (!this._modifiedEnd) {
    const _oldEnd = this.end;

    this.end = function(chunk, encoding) {
      const { _headers, statusCode } = this;

      if (_headers) {
        if (statusCode) {
          this.writeStatus(statusCode);
        }

        this.applyHeadersAndStatus();
      } else if (statusCode) {
        this.writeStatus(statusCode);
      }

      return _oldEnd.call(this, chunk, encoding);
    };

    this._modifiedEnd = true;
  }
  return this;
}
