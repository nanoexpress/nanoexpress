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
const AllowedMembers = ['req', 'res'];

const lineGoHandle = (string, handler) =>
  string
    .split('\n')
    .map(handler)
    .join('\n');

const isMalicius = (string) =>
  !string.startsWith('async') && !string.startsWith('(re');

export default (fn, isRaw = true) => {
  const fnString = fn.toString();

  if (
    fnString.length > 1024 ||
    fnString.indexOf('res.end') === -1 ||
    fnString.indexOf('middleware') !== -1 ||
    fnString.indexOf('prepared') !== -1
  ) {
    return {
      simple: false,
      reason: 'complex'
    };
  }
  if (isMalicius(fnString)) {
    return {
      simple: false,
      reason: 'warning'
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

    const member = line.replace(/return /g, '').substr(0, 3);
    const isComment = member.indexOf('//') === 0;
    if (index === 0) {
      if (line.indexOf('async') === 0 && !async) {
        line = line.substr(6);
      }
      if (line.indexOf('(req, res)') !== -1 && isRaw) {
        line = line.substr(10);
        line = '(res, req)' + line;
      }
    } else if (member && member.length === 3 && !isComment) {
      if (AllowedMembers.indexOf(member) === -1) {
        simple = false;
        return line;
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
      if (
        HttpRequestAdvancedProps.some(
          (prop) => line.indexOf('req.' + prop) !== -1
        )
      ) {
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
      simple,
      reason: 'mismatch'
    };
  }

  try {
    const handler = new Function('return ' + newFnString)();
    return {
      simple,
      handler
    };
  } catch (e) {
    return { simple: false, reason: 'error' };
  }
};
