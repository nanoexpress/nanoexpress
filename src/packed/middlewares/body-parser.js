const qs = require('querystring');

module.exports = ({ json = true, urlEncoded = true } = {}) => {
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
          req.body = qs.parse(req.body);
        }
      }
    }
    next();
  };
};
