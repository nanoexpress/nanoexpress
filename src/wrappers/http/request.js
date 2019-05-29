import { headers, cookies, queries, params, body } from '../../normalizers';

const bodyDisallowedMethods = ['get', 'options', 'head', 'trace', 'ws'];

export default async (req, res) => {
  req.path = req.getUrl();
  req.method = req.getMethod();

  // Alias for Express-module
  req.url = req.path;

  // IP solution still in progress
  // I decided not use this method as who needs
  // manually requests
  // req.ip = Buffer.from(res.getRemoteAddress()).toString('hex');

  req.headers = headers(req, req.headers);
  req.cookies = cookies(req, req.cookies);
  req.params = params(req, req.params);
  req.query = queries(req, req.query);

  if (bodyDisallowedMethods.indexOf(req.method) === -1) {
    req.body = await body(req, res);
  }

  return req;
};
