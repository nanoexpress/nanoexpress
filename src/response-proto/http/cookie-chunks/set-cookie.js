import cookie from 'cookie';

export default function setCookie(name, value, options) {
  if (options.expires && Number.isInteger(options.expires)) {
    options.expires = new Date(options.expires);
  }
  const serialized = cookie.serialize(name, value, options);

  let getCookie = this.getHeader('Set-Cookie');

  if (!getCookie) {
    this.setHeader('Set-Cookie', serialized);
    return undefined;
  }

  if (typeof getCookie === 'string') {
    getCookie = [getCookie];
  }

  getCookie.push(serialized);

  this.removeHeader('Set-Cookie');
  this.setHeader('Set-Cookie', getCookie);
  return this;
}
