import { headers, cookies, queries, params, body } from '../../normalizers';

function getIPBuffer() {
  return this.__response.getRemoteAddress();
}

export default (req, res, bodyCall, schema) => {
  req.path = req.getUrl();
  req.url = req.path;
  req.method = req.method || req.getMethod();

  // Alias for Express-module
  // TODO: make this normalized
  req.url = req.path;
  req.originalUrl = req.url;
  req.baseUrl = req.url;

  req.__response = res;
  req.getIPBuffer = getIPBuffer;

  req.headers =
    !schema || schema.headers !== false
      ? headers(req, req.headers, schema && schema.headers)
      : req.headers;
  req.cookies =
    !schema || schema.cookies !== false
      ? cookies(req, req.cookies, schema && schema.cookies)
      : req.cookies;
  req.params =
    !schema || schema.params !== false
      ? params(req, req.params, schema && schema.params)
      : req.params;
  req.query =
    !schema || schema.query !== false
      ? queries(req, req.query, schema && schema.query)
      : req.query;

  if (bodyCall) {
    return body(req, res).then((body) => {
      req.body = body;
      return req;
    });
  }

  return req;
};
