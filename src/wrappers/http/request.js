import { headers, cookies, queries, params, body } from '../../normalizers';

function getIPBuffer() {
  return this.__response.getRemoteAddress();
}

export default (req, res, bodyCall, schema) => {
  req.path = req.getUrl();
  req.method = req.method || req.getMethod();

  // Alias for Express-module
  req.url = req.path;

  req.__response = res;
  req.getIPBuffer = getIPBuffer;

  req.headers =
    !schema && schema.headers !== false
      ? headers(req, req.headers, schema && schema.headers)
      : req.cookies;
  req.cookies =
    !schema && schema.cookies !== false && req.headers
      ? cookies(req, req.cookies, schema && schema.cookies)
      : req.cookies;
  req.params =
    !schema && schema.params !== false
      ? params(req, req.params, schema && schema.params)
      : req.cookies;
  req.query =
    !schema && schema.query !== false
      ? queries(req, req.query, schema && schema.query)
      : req.cookies;

  if (bodyCall) {
    return body(req, res).then((body) => {
      req.body = body;
      return req;
    });
  }

  return req;
};
