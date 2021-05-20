export default function requestPipe(stream) {
  const { __response: res } = this;

  if (stream === res) {
    res.pipe(this.stream);
  } else {
    this.stream.pipe(stream);
  }

  return this;
}
