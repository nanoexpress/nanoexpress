export default function(stream) {
  stream.write(this.body);
  stream.end();

  return this;
}
