import { http } from '../wrappers';

export default (path, fn, config) => {
  return async (res, req) => {
    // For future usage
    req.rawPath = path;

    const request = await http.request(req, res, config);
    const response = await http.response(res, req, config);
    const result = await fn(request, response, config);

    res.send(result);
  };
};
