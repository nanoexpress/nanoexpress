export default function applyHeadersAndStatus() {
  const { _headers, statusCode, aborted, corks } = this;

  if (aborted) {
    return this;
  }

  if (typeof statusCode === 'string') {
    corks.push(() => {
      this.writeStatus(statusCode);
    });
  }

  this.writeHeaders(_headers);
  for (const header in _headers) {
    this.removeHeader(header);
  }

  return this;
}
