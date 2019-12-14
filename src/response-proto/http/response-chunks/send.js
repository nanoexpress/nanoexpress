export default function send(result) {
  if (!result) {
    result = '';
  } else if (typeof result === 'object') {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { fastJson, rawStatusCode: statusCode } = this;

    if (fastJson) {
      if (typeof fastJson === 'function') {
        result = fastJson(result);
      } else if (fastJson && typeof fastJson[statusCode] === 'function') {
        result = fastJson[statusCode](result);
      } else {
        const _statusCode = statusCode + '';
        for (let code in fastJson) {
          const fastJsonFunc = fastJson[code];
          if (code === _statusCode) {
            result = fastJsonFunc(result);
          } else if (code.indexOf('X') !== -1) {
            for (let i = 0; i < 3; i++) {
              if (code.charAt(i) === 'X') {
                code =
                  code.substr(0, i) +
                  _statusCode.charAt(i) +
                  code.substr(i, code.length - (i + 1));
              }
            }

            if (code == _statusCode) {
              result = fastJsonFunc(result);
            }
          }
        }
      }
    } else {
      result = JSON.stringify(result);
    }
  }

  return this.end(result);
}
