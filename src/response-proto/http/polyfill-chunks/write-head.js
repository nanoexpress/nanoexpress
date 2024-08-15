export default function writeHead(_code, _headers) {
  let code = _code;
  let headers = _headers;

  if (typeof code === 'object' && !headers) {
    headers = code;
    code = 200;
  }

  if (headers !== undefined) {
    this.setHeaders(headers);
  }
  if (code !== undefined && code !== 200) {
    this.status(code);
  }

  return this;
}
