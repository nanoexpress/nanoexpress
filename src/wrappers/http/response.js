import { HttpResponse } from '../../proto';

export default (res, req, config, schema) => {
  // Extending proto
  const { __proto__ } = res;
  for (const newMethod in HttpResponse) {
    __proto__[newMethod] = HttpResponse[newMethod];
  }

  // Attach Schema
  res.schema = schema;

  // Attach Config
  res.config = config;

  // Attach request
  res.__request = req;

  return res;
};
