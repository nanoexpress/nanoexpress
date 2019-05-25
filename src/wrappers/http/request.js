import { headers, queries, params, body } from '../../normalizers';

export default async (req, res) => {
  req.path = req.getUrl();
  req.method = req.getMethod();

  // IP solution still in progress
  req.ip = Buffer.from(res.getRemoteAddress()).toString('hex');

  req.headers = Object.assign(req.headers || {}, headers(req));
  req.query = Object.assign(req.query || {}, queries(req));
  req.params = Object.assign(req.params || {}, params(req));
  req.body = Object.assign(req.body || {}, await body(res));

  return req;
};
