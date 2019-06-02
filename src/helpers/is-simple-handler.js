import HttpProtoExtendable from '../proto/http/HttpResponse';

const HttpRequestAdvancedProps = [
  'params',
  'query',
  'cookies',
  'body',
  'path',
  'rawPath',
  'url',
  'method'
];

const lineGoHandle = (string, handler) =>
  string
    .split('\n')
    .map(handler)
    .join('\n');

const isMalicius = (string) =>
  !string.startsWith('async') && !string.startsWith('(re');

export default (fn) => {
  const fnString = fn.toString();

  if (fnString.length > 1024) {
    return {
      simple: false
    };
  }
  if (isMalicius(fnString)) {
    return {
      simple: false
    };
  }

  let simple = true;
  const async =
    fnString.indexOf('await') !== -1 && fnString.indexOf('res.end') === -1;

  const newFnString = lineGoHandle(fnString, (line, index) => {
    line = line.trim();

    if (!line) {
      return line;
    }

    if (index === 0) {
      if (line.indexOf('async') === 0 && !async) {
        line = line.substr(6);
      }
      if (line.indexOf('(req, res)') !== -1) {
        line = line.substr(10);
        line = '(res, req)' + line;
      }
    }

    if (line.indexOf('req.headers') !== -1) {
      const noDirectProp = /\[|\]|'/g;
      let headerName = line.substr(line.indexOf('req.headers') + 12);
      let isDirect = true;

      if (noDirectProp.test(headerName)) {
        headerName = headerName.replace(noDirectProp, '');
        isDirect = false;
      }

      headerName = headerName.replace(/[;()]/g, '');

      if (isDirect) {
        line = line.replace(
          'req.headers.' + headerName,
          'req.getHeader(\'' + headerName + '\')'
        );
      } else {
        line = line.replace(
          'req.headers[\'' + headerName + '\']',
          'req.getHeader(\'' + headerName + '\')'
        );
      }
    }

    if (line.indexOf('req.') !== -1) {
      const matchMethod = line.match(/req\.(.*)\(/);

      if (matchMethod && HttpRequestAdvancedProps.includes(matchMethod[1])) {
        simple = false;
      }
    }

    if (line.indexOf('res.') !== -1) {
      const matchMethod = line.match(/res\.(.*)\(/);

      if (matchMethod && HttpProtoExtendable[matchMethod[1]]) {
        simple = false;
      }
    }

    return line;
  });

  if (!simple) {
    return {
      simple
    };
  }

  return {
    simple,
    handler: new Function('return ' + newFnString)()
  };
};
