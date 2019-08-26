import { parse } from 'querystring';

export default ({ json = true, urlEncoded = true } = {}) => {
  return (req, res, next) => {
    const { headers, body } = req;

    if (headers) {
      const contentType = headers['content-type'];
      if (contentType) {
        if (json && contentType.indexOf('/json') !== -1) {
          req.body = JSON.parse(body);
        } else if (
          urlEncoded &&
          contentType.indexOf('/x-www-form-urlencoded') !== -1
        ) {
          req.body = parse(req.body);
        }
      }
    }
    next();
  };
};
