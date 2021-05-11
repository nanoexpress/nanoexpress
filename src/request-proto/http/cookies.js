import cookieCtx from 'cookie';

export default (req) => {
  let cookies;
  const { headers } = req;
  const headerCookie =
    (headers && headers.cookie) || (req && req.getHeader('cookie'));

  if (headerCookie) {
    if (cookies) {
      const parsedCookie = cookieCtx.parse(headerCookie);
      for (const cookie in parsedCookie) {
        cookies[cookie] = parsedCookie[cookie];
      }
    } else if (!cookies) {
      cookies = cookieCtx.parse(headerCookie);
    }
  }
  return cookies;
};
