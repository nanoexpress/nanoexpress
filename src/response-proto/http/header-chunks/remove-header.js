export default function removeHeader(key) {
  if (!this._headers || !this._headers[key]) {
    return undefined;
  }
  if (!this._modifiedEnd) {
    this.modifyEnd();
  }
  delete this._headers[key];

  return this;
}
