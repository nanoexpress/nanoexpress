import { headers, queries, params, body } from '../../normalizers';

const bodyMethods = ['post', 'put', 'delete'];
export default async (req, res) => {
  req.path = req.getUrl();
  req.method = req.getMethod();

  // IP solution still in progress
  // I decided not use this method as who needs
  // manually requests
  // req.ip = Buffer.from(res.getRemoteAddress()).toString('hex');

  req.headers = headers(req, req.headers);
  req.params = params(req, req.params);
  req.query = queries(req, req.query);
  req.body =
    bodyMethods.indexOf(req.method) !== -1 && res.onData && (await body(res));

  return req;
};
