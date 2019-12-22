import { parse } from 'querystring';

export default ({ json = true, urlEncoded = true } = {}) => {
  const middleware = async (req) => {
    const { headers, body } = req;

    if (headers && body) {
      const contentType = headers['content-type'];
      if (contentType) {
        if (json && contentType.indexOf('/json') !== -1) {
          req.body = JSON.parse(body);
        } else if (
          urlEncoded &&
          contentType.indexOf('/x-www-form-urlencoded') !== -1
        ) {
          req.body = parse(body);
        }
      }
    }
  };
  middleware.methods = 'POST, PUT, DELETE';

  return middleware;
};
