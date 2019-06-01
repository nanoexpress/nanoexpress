export default function writeHead(code, headers) {
  if (typeof code === 'object' && !headers) {
    headers = code;

    if (typeof this.statusCode === 'object') {
      this.statusCode = 200;
    }

    code = this.statusCode || 200;
  }

  if (code !== undefined) {
    this.status(code);
  }
  if (headers !== undefined) {
    this.setHeaders(headers);
  }

  return this;
}
