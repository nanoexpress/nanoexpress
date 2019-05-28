import { headers, queries, params, body } from '../../normalizers';

const bodyDisallowedMethods = ['get', 'options', 'head', 'trace', 'ws'];

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
    bodyDisallowedMethods.indexOf(req.method) === -1 && (await body(req, res));

  // Clean Request
  if (!req.body) {
    delete req.body;
  }

  return req;
};
