import cookieCtx from 'cookie';

export default (req, schema) => {
  let cookies;
  const { headers } = req;
  const headerCookie =
    (headers && headers.cookie) || (req && req.getHeader('cookie'));

  if (headerCookie) {
    if (cookies) {
      const parsedCookie = cookieCtx.parse(headerCookie);
      if (schema) {
        const { properties } = schema;
        for (const cookie in properties) {
          cookies[cookie] = parsedCookie[cookie];
        }
      } else {
        for (const cookie in parsedCookie) {
          cookies[cookie] = parsedCookie[cookie];
        }
      }
    } else if (!cookies) {
      cookies = cookieCtx.parse(headerCookie);
    }
  }
  return cookies;
};
