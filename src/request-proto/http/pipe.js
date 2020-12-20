export default function requestPipe(stream) {
  stream.write(this.buffer);
  stream.end();

  return this;
}
