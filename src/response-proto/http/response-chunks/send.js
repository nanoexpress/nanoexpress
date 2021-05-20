export default function send(result) {
  if (!result) {
    result = '';
  } else if (typeof result === 'object') {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { serializer, rawStatusCode: statusCode } = this;

    if (serializer) {
      if (typeof serializer === 'function') {
        result = serializer(result);
      } else if (serializer && typeof serializer[statusCode] === 'function') {
        result = serializer[statusCode](result);
      } else {
        const _statusCode = `${statusCode}`;
        for (let code in serializer) {
          const fastJsonFunc = serializer[code];
          if (code === _statusCode) {
            result = fastJsonFunc(result);
          } else if (code.indexOf('X') !== -1) {
            for (let i = 0; i < 3; i += 1) {
              if (code.charAt(i) === 'X') {
                code =
                  code.substr(0, i) +
                  _statusCode.charAt(i) +
                  code.substr(i, code.length - (i + 1));
              }
            }

            // eslint-disable-next-line eqeqeq
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
