import { http } from '../wrappers';
import fastJson from 'fast-json-stringify';

export default (path, fn, config, { schema } = {}) => {
  // For easier aliasing
  let responseSchema;
  if (typeof schema === 'object' && typeof schema.response === 'object') {
    responseSchema = fastJson(schema.response);
  }
  return async (res, req) => {
    // For future usage
    req.rawPath = path;

    let request;

    // Don't run `await` immediately for small performance gain
    if (res.onData) {
      request = await http.request(req, res, config);
    } else {
      request = http.request(req, res, config);
    }

    const response = http.response(res, req, config, responseSchema);

    const result = await fn(request, response, config);

    res.send(result);
  };
};
