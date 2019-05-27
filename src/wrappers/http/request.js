import { headers, queries, params, body } from '../../normalizers';

export default async (req, res) => {
  req.path = req.getUrl();
  req.method = req.getMethod();

  // IP solution still in progress
  req.ip = Buffer.from(res.getRemoteAddress()).toString('hex');

  req.headers = headers(req, req.headers);
  req.params = params(req, req.params);
  req.query = Object.assign(req.query || {}, queries(req));
  req.body = res.onData && (await body(res));

  return req;
};
