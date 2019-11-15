const PARAMS_REGEX = /:([A-Za-z0-9_-]+)/g;

export default (rawPath) => {
  if (rawPath.indexOf(':') !== -1) {
    const paramsArray = rawPath.match(PARAMS_REGEX);

    if (paramsArray) {
      return paramsArray.map((name) => name.substr(1));
    }
  }

  return null;
};
