export default function type(type) {
  this.setHeader('Content-Type', type);

  return this;
}
