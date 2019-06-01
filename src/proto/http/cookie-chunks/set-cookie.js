const { serialize } = require('cookie');

export default function setCookie(name, value, options) {
  if (options.expires && Number.isInteger(options.expires)) {
    options.expires = new Date(options.expires);
  }
  const serialized = serialize(name, value, options);

  let setCookie = this.getHeader('Set-Cookie');

  if (!setCookie) {
    this.setHeader('Set-Cookie', serialized);
    return undefined;
  }

  if (typeof setCookie === 'string') {
    setCookie = [setCookie];
  }

  setCookie.push(serialized);

  this.removeHeader('Set-Cookie');
  this.setHeader('Set-Cookie', setCookie);
  return this;
}
