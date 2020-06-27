export default function writeHeaderValues(header, values) {
  for (let i = 0, len = values.length; i < len; i++) {
    this.writeHeader(header, values[i] + '');
  }
}
