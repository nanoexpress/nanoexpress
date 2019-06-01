export default function cork(result) {
  this.experimental_cork
    ? (result) =>
      this.experimental_cork(() => {
        this.send(result);
      })
    : this.send(result);

  return this;
}
