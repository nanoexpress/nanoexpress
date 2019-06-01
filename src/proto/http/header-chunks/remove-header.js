export default function removeHeader(key) {
  if (!this._headers || !this._headers[key]) {
    return undefined;
  }
  this.modifyEnd();
  this._headers[key] = null;
  delete this._headers[key];

  return this;
}
