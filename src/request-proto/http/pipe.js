export default function (stream) {
  stream.write(this.buffer);
  stream.end();

  return this;
}
