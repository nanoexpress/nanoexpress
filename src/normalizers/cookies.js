let cookie;

try {
  cookie = require('cookie');
} catch (e) {
  console.error(
    '[nanoexpress]: `cookie` was not found in your dependencies list' +
      ', please install yourself for this feature working properly'
  );
}

export default (req) => {
  if (!cookie || !cookie.parse) {
    return;
  }
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
