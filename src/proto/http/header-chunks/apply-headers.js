export default function applyHeaders() {
  const { _headers, _headersCount } = this;
  if (_headersCount > 0) {
    for (const header in _headers) {
      const value = _headers[header];

      if (value !== undefined && value !== null) {
        if (value.splice && value.length) {
          this.writeHeaderValues(header, value);
        } else {
          this.writeHeader(header, value);
        }
        this.removeHeader(header);
      }
    }
  }

  return this;
}
