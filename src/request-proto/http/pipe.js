export default function requestPipe(stream) {
  stream.write(this.body);
  stream.end();

  return this;
}
