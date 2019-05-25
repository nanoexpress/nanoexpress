import { http } from '../wrappers';

export default (path, fn) => {
  return async (res, req) => {
    // For future usage
    req.rawPath = path;

    const request = await http.request(req, res);
    const response = await http.response(res);
    let result = await fn(request, response);

    // Simulate async return :)
    if (typeof result === 'object' && result) {
      res.setHeader('Content-Type', 'application/json');
      result = JSON.stringify(result);
    } else if (typeof result === 'string' && result.startsWith('<xml')) {
      res.setHeader('Content-Type', 'application/xml');
    }

    res.end(result);
  };
};
