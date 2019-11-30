export default (req, schema) => {
  let headers;
  if (schema) {
    const { properties } = schema;
    for (const property in properties) {
      if (!headers) {
        headers = {};
      }
      headers[property] = req.getHeader(property);
    }
    return headers;
  } else if (schema !== false) {
    req.forEach((key, value) => {
      if (!headers) {
        headers = {};
      }
      headers[key] = value;
    });
  }
  return headers;
};
