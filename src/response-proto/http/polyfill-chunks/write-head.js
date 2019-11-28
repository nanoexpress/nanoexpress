export default function writeHead(code, headers) {
  if (typeof code === 'object' && !headers) {
    headers = code;
    code = 200;
  }

  if (code !== undefined && code !== 200) {
    this.status(code);
  }
  if (headers !== undefined) {
    this.setHeaders(headers);
  }

  return this;
}
