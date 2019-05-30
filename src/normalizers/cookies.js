const { parse } = require('cookie');

module.exports = (req, cookies = {}) => {
  const { headers } = req;
  const headerCookie = headers && headers.cookie;

  if (headerCookie) {
    if (cookies) {
      const parsedCookie = parse(headerCookie);
      for (const cookie in parsedCookie) {
        cookies[cookie] = parsedCookie[cookie];
      }
    } else if (!cookies) {
      cookies = parse(headerCookie);
    }
  }
  return cookies;
};
