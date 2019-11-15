import { parse } from 'querystring';

module.exports = ({ json = true, urlEncoded = true } = {}) => {
  return (req, res, next) => {
    const { headers, body } = req;

    let error = null;

    if (headers && body) {
      const contentType = headers['content-type'];
      if (contentType) {
        try {
          if (json && contentType.indexOf('/json') !== -1) {
            req.body = JSON.parse(body);
          } else if (
            urlEncoded &&
            contentType.indexOf('/x-www-form-urlencoded') !== -1
          ) {
            req.body = parse(req.body);
          }
        } catch (e) {
          error = e;
        }
      }
    }

    next(error);
  };
};
