import { HttpResponse } from '../../proto';

export default (res, req, config) => {
  // Attach request
  res.__request = req;

  // Extending proto
  const { __proto__ } = res;
  for (const newMethod in HttpResponse) {
    __proto__[newMethod] = HttpResponse[newMethod];
  }

  // Default HTTP Raw Status Code Integer
  res.rawStatusCode = 200;

  // Attach Config
  res.config = config;

  return res;
};
