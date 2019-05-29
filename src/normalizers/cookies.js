const { parse } = require('cookie');

module.exports = (req, cookies = {}) => {
  const { headers } = req;

  if (cookies && headers && headers.cookie) {
    const parsedCookie = parse(headers.cookie);
    for (const cookie in parsedCookie) {
      cookies[cookie] = parsedCookie[cookie];
    }
  } else if (!cookies && headers && headers.cookie) {
    cookies = parse(headers.cookie);
  }
  return cookies;
};
