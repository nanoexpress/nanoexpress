const { parse, serialize } = require('cookie');

module.exports = async (req, res) => {
  const { headers } = req;
  let { cookies } = req;

  if (cookies && headers.cookie) {
    Object.assign(cookies, parse(headers.cookie));
  } else if (!cookies && headers.cookie) {
    cookies = parse(headers.cookie);
  } else if (!cookies) {
    cookies = {};
  }
  req.cookies = cookies;

  res.setCookie =
    res.setCookie ||
    ((name, value, options = {}) => {
      let { expires } = options;
      if (expires && Number.isInteger(expires)) {
        expires = new Date(expires);
      }
      const serialized = serialize(name, value, {
        ...options,
        expires
      });

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
      res.setCookie(name, '', {
        ...options,
        expires: Date.now() - 1000
      });
    });
};
