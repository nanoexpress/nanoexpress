import cookie from 'cookie';

export default (req) => {
  let cookies;
  const { headers } = req;
  const headerCookie =
    (headers && headers.cookie) || (req && req.getHeader('Cookie'));

  if (headerCookie) {
    if (cookies) {
      const parsedCookie = cookie.parse(headerCookie);
      for (const cookie in parsedCookie) {
        cookies[cookie] = parsedCookie[cookie];
      }
    } else if (!cookies) {
      cookies = cookie.parse(headerCookie);
    }
  }
  return cookies;
};
