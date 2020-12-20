export default (code) => {
  const codeInteger = +code;
  if (
    typeof codeInteger === 'number' &&
    codeInteger > 100 &&
    codeInteger < 600
  ) {
    return 1;
  }
  if (
    typeof code === 'string' &&
    code.length === 3 &&
    code.indexOf('X') !== -1
  ) {
    return 2;
  }
  return 0;
};
