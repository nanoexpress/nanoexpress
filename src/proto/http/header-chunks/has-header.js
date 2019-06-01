export default function hasHeader(key) {
  return (
    !!this._headers &&
    this._headers[key] !== undefined &&
    this._headers[key] !== null
  );
}
