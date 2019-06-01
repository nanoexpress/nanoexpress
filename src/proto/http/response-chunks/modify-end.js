export default function modifyEnd() {
  if (!this._modifiedEnd) {
    const _oldEnd = this.end;

    this.end = function(chunk, encoding) {
      this.writeHead(this.statusCode || 200, this._headers);
      if (this.statusCode) {
        this.writeStatus(this.statusCode);
      }
      this.applyHeaders();

      return _oldEnd.call(this, chunk, encoding);
    };

    this._modifiedEnd = true;
  }
  return this;
}
