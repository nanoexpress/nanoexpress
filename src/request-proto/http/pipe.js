export default function requestPipe(stream) {
  if (stream.end !== undefined) {
    stream.pipe(this.stream);
  } else {
    this.stream.pipe(stream);
  }

  return this;
}
