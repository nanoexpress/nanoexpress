export default (req, matches) => {
  let params;
  if (matches) {
    if (!params && matches.length > 0) {
      params = {};
    }
    for (let i = 0, len = matches.length; i < len; i += 1) {
      params[matches[i]] = req.getParameter(i);
    }
  }

  return params;
};
