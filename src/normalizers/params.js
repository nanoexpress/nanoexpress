const PARAMS_REGEX = /:([A-Za-z0-9_-]+)/g;

export default (req, params) => {
  const { rawPath } = req;

  if (rawPath.indexOf(':') !== -1) {
    const paramsMatch = rawPath.match(PARAMS_REGEX);

    if (paramsMatch) {
      if (!params) {
        params = {};
      }
      for (let i = 0, len = paramsMatch.length; i < len; i++) {
        const name = paramsMatch[i];
        params[name.substr(1)] = req.getParameter(i);
      }
    }
  }

  return params;
};
