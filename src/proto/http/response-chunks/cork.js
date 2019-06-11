export default function cork(fn) {
  if (this.experimental_cork) {
    this.experimental_cork(fn);
  }

  return this;
}
