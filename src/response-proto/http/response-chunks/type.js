export default function type(contentType) {
  this.setHeader('Content-Type', contentType);

  return this;
}
