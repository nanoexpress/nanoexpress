import { debug } from '../../../helpers/logs.js';

export default function send(result) {
  let _result = '';
  let corkHandler = () => {
    // noop
  };

  if (this.aborted) {
    debug({
      message: 'request was aborted',
      file: 'send.js',
      line: [20, 30],
      kind: 'handler',
      case: 'log',
      meta: {
        isCorked: this.corked,
        isAborted: this.aborted
      }
    });
    return;
  }

  if (typeof result === 'object') {
    corkHandler = () => {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
    };

    const { serializer, rawStatusCode: statusCode } = this;

    if (serializer) {
      if (typeof serializer === 'function') {
        _result = serializer(result);
      } else if (serializer && typeof serializer[statusCode] === 'function') {
        _result = serializer[statusCode](result);
      } else {
        const _statusCode = `${statusCode}`;
        for (let code in serializer) {
          const fastJsonFunc = serializer[code];
          if (code === _statusCode) {
            _result = fastJsonFunc(result);
          } else if (code.indexOf('X') !== -1) {
            for (let i = 0; i < 3; i += 1) {
              if (code.charAt(i) === 'X') {
                code =
                  code.substr(0, i) +
                  _statusCode.charAt(i) +
                  code.substr(i, code.length - (i + 1));
              }
            }

            if (code === _statusCode) {
              _result = fastJsonFunc(result);
            }
          }
        }
      }
    } else {
      _result = JSON.stringify(result);
    }
  } else {
    _result = result;
  }

  return this.cork(() => {
    this.corked = true;

    corkHandler();
    return this.end(_result);
  });
}
