export default function applyHeadersAndStatus() {
  const { _headers, statusCode } = this;

  if (typeof statusCode === 'string') {
    this.writeStatus(statusCode);
    this.statusCode = 200;
  }

  for (const header in _headers) {
    const value = _headers[header];

    if (value) {
      if (value.splice && value.length) {
        this.writeHeaderValues(header, value);
      } else {
        this.writeHeader(header, value);
      }
      this.removeHeader(header);
    }
  }

  return this;
}
