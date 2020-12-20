export default function writeHeaderValues(header, values) {
  for (let i = 0, len = values.length; i < len; i += 1) {
    this.writeHeader(header, `${values[i]}`);
  }
}
