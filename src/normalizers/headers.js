export default (req, headers) => {
  req.forEach((key, value) => {
    if (!headers) {
      headers = {};
    }
    headers[key] = value;
  });
  return headers;
};
