export default function removeCookie(name, options = {}) {
  const currTime = Date.now();
  if (!options.expires || options.expires >= currTime) {
    options.expires = currTime - 1000;
  }
  this.setCookie(name, '', options);
  return this;
}
