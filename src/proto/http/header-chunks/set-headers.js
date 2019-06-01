export default function setHeaders(headers) {
  for (const header in headers) {
    if (this._headers) {
      const currentHeader = this._headers[header];
      if (currentHeader !== undefined || currentHeader !== null) {
        continue;
      }
    }
    this.setHeader(header, headers[header]);
  }

  return this;
}
