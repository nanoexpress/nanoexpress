const PARAMS_REGEX = /:([A-Za-z]+)/g;

export default (req, params = {}) => {
  const paramsMatch = req.rawPath.match(PARAMS_REGEX);

  if (paramsMatch && paramsMatch.length > 0) {
    paramsMatch.forEach((name, index) => {
      params[name.substr(1)] = req.getParameter(index);
    });
  }

  return params;
};
