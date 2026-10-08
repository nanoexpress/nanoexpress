import { stringifySetCookie } from 'cookie';

/**
 * Set cookie
 * @param {string} name
 * @param {string | number} value
 * @param {Partial<SetCookie>} options
 * @returns {string}
 */
export default function setCookie(name, value, options = {}) {
  if (options.expires && Number.isInteger(options.expires)) {
    options.expires = new Date(options.expires);
  }
  const serialized = stringifySetCookie({ ...options, name, value });

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
