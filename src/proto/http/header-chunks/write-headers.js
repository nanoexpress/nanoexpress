export default function writeHeaders(headers) {
  for (const header in headers) {
    const value = headers[header];
    if (value !== undefined && value !== null) {
      if (value.splice && value.length) {
        this.writeHeaderValues(header, value);
      } else {
        this.writeHeader(header, value);
      }
    }
  }
  return this;
}
