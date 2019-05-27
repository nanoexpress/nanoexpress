import { parse, serialize } from 'cookie';

export default async (req, res) => {
  const { headers } = req;
  let { cookie } = req;

  if (cookie && headers.cookie) {
    Object.assign(cookie, cookie.parse(headers.cookie));
  } else if (!cookie && headers.cookie) {
    cookie = parse(headers.cookie);
  } else if (!cookie) {
    cookie = {};
  }
  req.cookie = cookie;

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

  res.hasCookie = res.hasCookie || ((name) => cookie[name] !== undefined);

  res.removeCookie =
    res.removeCookie ||
    ((name, options = {}) => {
      res.setCookie(name, '', {
        ...options,
        expires: Date.now() - 1000
      });
    });
};
