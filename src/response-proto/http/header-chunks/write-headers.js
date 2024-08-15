export default function writeHeaders(headers) {
  const { corks } = this;

  for (const header in headers) {
    const value = headers[header];
    if (value) {
      if (value.splice) {
        this.writeHeaderValues(header, value);
      } else {
        corks.push(() => {
          this.writeHeader(header, `${value}`);
        });
      }
    }
  }
  return this;
}
