import { headers, cookies, queries, params, body } from '../../normalizers';

function getIPBuffer() {
  return this.__response.getRemoteAddress();
}

export default (req, res, bodyCall) => {
  req.path = req.getUrl();
  req.method = req.method || req.getMethod();

  // Alias for Express-module
  req.url = req.path;

  req.__response = res;
  req.getIPBuffer = getIPBuffer;

  req.headers = headers(req, req.headers);
  req.cookies = cookies(req, req.cookies);
  req.params = params(req, req.params);
  req.query = queries(req, req.query);

  if (bodyCall) {
    return body(req, res).then((body) => {
      req.body = body;
      return req;
    });
  }

  return req;
};
