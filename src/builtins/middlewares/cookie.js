const { parse, serialize } = require('cookie');

module.exports = async (req, res) => {
  const { headers } = req;
  let { cookies } = req;

  if (cookies && headers.cookie) {
    const parsedCookie = parse(headers.cookie);
    for (const cookie in parsedCookie) {
      cookies[cookie] = parsedCookie[cookie];
    }
  } else if (!cookies && headers.cookie) {
    cookies = parse(headers.cookie);
  } else if (!cookies) {
    cookies = {};
  }
  req.cookies = cookies;

  res.setCookie =
    res.setCookie ||
    ((name, value, options = {}) => {
      if (options.expires && Number.isInteger(options.expires)) {
        options.expires = new Date(options.expires);
      }
      const serialized = serialize(name, value, options);

      let setCookie = req.getHeader('Set-Cookie');
      if (!setCookie) {
        res.setHeader('Set-Cookie', serialized);
        return;
      }

      if (typeof setCookie === 'string') {
        setCookie = [setCookie];
      }

      setCookie.push(serialized);
      res.removeHeader('Set-Cookie');
      res.setHeader('Set-Cookie', setCookie);
    });

  res.hasCookie = res.hasCookie || ((name) => cookies[name] !== undefined);

  res.removeCookie =
    res.removeCookie ||
    ((name, options = {}) => {
      const currTime = Date.now();
      if (!options.expires || options.expires >= currTime) {
        options.expires = currTime - 1000;
      }
      res.setCookie(name, '', options);
    });
};
