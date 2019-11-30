export default function getHeader(key) {
  return !!this._headers && !!key && this._headers[key];
}
