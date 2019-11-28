export default function setHeader(key, value) {
  !this._modifiedEnd && this.modifyEnd();

  if (!this._headers) {
    this._headers = {};
  }
  this._headers[key] = value;
  return this;
}
