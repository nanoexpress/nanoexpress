import { HttpResponse } from '../../proto';

export default (res, req, config, schema) => {
  // Attach request
  res.__request = req;

  // Extending proto
  const { __proto__ } = res;
  for (const newMethod in HttpResponse) {
    __proto__[newMethod] = HttpResponse[newMethod];
  }

  // Attach Schema
  res.schema = schema;

  // Attach Config
  res.config = config;

  return res;
};
