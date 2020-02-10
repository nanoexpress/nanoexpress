import { parse } from 'querystring';

export default ({ json = true, urlEncoded = true } = {}) => {
  const middleware = async (req) => {
    const { headers, body } = req;

    if (headers && body) {
      const contentType = headers['content-type'];
      if (contentType) {
        if (json && contentType.indexOf('/json') !== -1) {
          req.body = JSON.parse(
            typeof body === 'string' ? body : body.toString()
          );
        } else if (
          urlEncoded &&
          contentType.indexOf('/x-www-form-urlencoded') !== -1
        ) {
          if (typeof urlEncoded === 'object') {
            req.body = parse(
              typeof body === 'string' ? body : body.toString(),
              urlEncoded
            );
          } else {
            req.body = parse(typeof body === 'string' ? body : body.toString());
          }
        }
      }
    }
  };
  middleware.methods = 'POST, PUT, DELETE';

  return middleware;
};
