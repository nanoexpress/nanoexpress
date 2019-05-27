const { parse } = require('querystring');

module.exports = async (req) => {
  const { headers, body } = req;

  if (typeof body === 'string') {
    const contentType = headers['content-type'];
    if (contentType) {
      if (contentType.indexOf('/json') !== -1) {
        req.body = JSON.parse(body);
      } else if (contentType.indexOf('/x-www-form-urlencoded') !== -1) {
        req.body = parse(req.body);
      }
    }
  }
};
