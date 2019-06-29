export default (code) => {
  code = +code;
  if (typeof code === 'number' && code > 100 && code < 600) {
    return true;
  }
  return false;
};
