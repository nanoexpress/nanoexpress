export default (req, headers = {}) => {
  req.forEach((key, value) => {
    headers[key] = value;
  });
  return headers;
};
