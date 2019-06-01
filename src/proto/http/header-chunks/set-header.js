export default function setHeader(key, value) {
  this.modifyEnd();

  if (!this._headers) {
    this._headers = {};
    this._headersCount = 0;
  }
  this._headersCount++;
  this._headers[key] = value;
  return this;
}
