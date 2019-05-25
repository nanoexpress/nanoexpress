export default (req) => {
  const headers = {};
  req.forEach((key, value) => {
    headers[key] = value;
  });
  return headers;
};
