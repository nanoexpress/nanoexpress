export default function writeHeaders(headers) {
  for (const header in headers) {
    const value = headers[header];
    if (value) {
      if (value.splice) {
        this.writeHeaderValues(header, value);
      } else {
        this.writeHeader(header, value);
      }
    }
  }
  return this;
}
