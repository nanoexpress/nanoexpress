import responseMethods from '../response-proto/http/HttpResponse.js';

const nonSimpleProps = ['query', 'cookies', 'body'].map(
  (prop) => `req.${prop}`
);
const nonSimpleMethods = Object.keys(responseMethods).map(
  (method) => `res.${method}`
);

// eslint-disable-next-line no-useless-escape
const HEADER_PARAM_KEY_REGEX = /['"`;(){}\[\]]/g;
const HEADER_PARAM_KEY_CONST_REGEX = /(\{(.*)\})?\s+?=?\s+req./m;
const RETURN_TRIP_REGEX = /;/g;
const CONTENT_SPACE_TRIM_REGEX = /\s+/g;
const ARGUMENTS_MATCH_REG_EX = /\((req|res)\)/;
const DIRECT_SIMPLE_ASYNC_REG_EX = /async?\s+\((.*)\)\s+=>?\s+(.*)/g;

const convertParams = (params) => {
  if (!params) {
    return null;
  }
  const _params = {};
  for (let i = 0, len = params.length; i < len; i++) {
    _params[params[i]] = i;
  }
  return _params;
};

export default function compileRoute(fn, params) {
  const content = fn.toString().trim();
  const preparedParams = convertParams(params);

  // Don't parse dummy functions
  if (content === '() => {}') {
    return (req, res) => res.end('');
  }

  const lines = content.split('\n');

  let argumentsLine = lines.shift().trim();

  if (lines.length === 0) {
    if (argumentsLine.includes('async () =>')) {
      return compileRoute(
        argumentsLine.replace(
          DIRECT_SIMPLE_ASYNC_REG_EX,
          '($1) => {\nres.end($2)\n}'
        )
      );
    }
  }

  let returnLine = lines.pop();
  let buffyReturnLine = '';

  // Dirty fastest check for Simple function
  for (const prop of nonSimpleProps) {
    if (content.includes(prop)) {
      return null;
    }
  }

  // Dirty fastest check for Simple function
  for (const method of nonSimpleMethods) {
    if (content.includes(method)) {
      return null;
    }
  }

  if (argumentsLine.includes('async')) {
    argumentsLine = argumentsLine.substr(5);
  }

  if (argumentsLine.includes('(req)') || argumentsLine.includes('(res)')) {
    argumentsLine = argumentsLine.replace(ARGUMENTS_MATCH_REG_EX, '(req, res)');
  } else if (!argumentsLine.includes('(req, res)')) {
    argumentsLine =
      '(req, res) ' + argumentsLine.substr(argumentsLine.indexOf('()') + 2);
  }

  if (returnLine === '}' && lines.length > 0) {
    buffyReturnLine = returnLine;
    returnLine = lines.pop();
  }
  if (returnLine) {
    if (returnLine.includes('return')) {
      const tripLeft = returnLine.trim().substr(7);

      returnLine = `res.end(${tripLeft.replace(RETURN_TRIP_REGEX, '')})`;
    }
    if (returnLine.includes('(({') || returnLine.includes('({')) {
      returnLine = returnLine.replace(
        /res\.end\((.*)\)/g,
        'res.end(JSON.stringify($1))'
      );
    }
  }

  let contentLines = argumentsLine + '\n';

  if (lines.length > 0) {
    for (const line of lines) {
      if (line.includes('//')) {
        continue;
      }

      if (line.includes('req.headers')) {
        const headerKeyIndex = line.indexOf('req.headers');
        if (headerKeyIndex !== -1) {
          const headerKey = line
            .substr(headerKeyIndex + 12)
            .replace(HEADER_PARAM_KEY_REGEX, '');

          if (line.charAt(headerKeyIndex + 11) === '.') {
            contentLines += line.replace(
              'req.headers.' + headerKey,
              'req.getHeader(\'' + headerKey + '\')'
            );
          } else if (line.charAt(headerKeyIndex + 11) === '[') {
            contentLines += line.replace(
              'req.headers[\'' + headerKey + '\']',
              'req.getHeader(\'' + headerKey + '\')'
            );
          } else if (line.includes('req.headers;')) {
            const extractConstants = line.match(HEADER_PARAM_KEY_CONST_REGEX);

            if (extractConstants && extractConstants[2]) {
              const constants = extractConstants[2].trim().split(',');

              for (const header of constants) {
                contentLines += `const ${header} = req.getHeader('${header}');`;
              }
            }
          } else {
            return null;
          }
        }
      } else if (line.includes('req.params')) {
        const paramKeyIndex = line.indexOf('req.params');

        if (paramKeyIndex !== -1) {
          const paramKey = line
            .substr(paramKeyIndex + 11)
            .replace(HEADER_PARAM_KEY_REGEX, '');
          const paramIndex = preparedParams[paramKey];

          if (line.charAt(paramKeyIndex + 10) === '.') {
            contentLines += line.replace(
              'req.params.' + paramKey,
              'req.getParameter(\'' + paramIndex + '\')'
            );
          } else if (line.charAt(paramKeyIndex + 10) === '[') {
            contentLines += line.replace(
              'req.params[\'' + paramKey + '\']',
              'req.getParameter(\'' + paramIndex + '\')'
            );
          } else if (line.includes('req.params;')) {
            const extractConstants = line.match(HEADER_PARAM_KEY_CONST_REGEX);

            if (extractConstants && extractConstants[2]) {
              const constants = extractConstants[2].trim().split(',');

              for (const param of constants) {
                contentLines += `const ${param} = req.getParameter(${preparedParams[param]});`;
              }
            }
          } else {
            return null;
          }
        }
      } else {
        contentLines += line;
      }

      contentLines += '\n';
    }
  }
  if (returnLine) {
    contentLines += returnLine;
  }

  if (buffyReturnLine) {
    contentLines += '\n';
    contentLines += buffyReturnLine;
  }

  contentLines = contentLines.replace(CONTENT_SPACE_TRIM_REGEX, ' ');

  return eval(contentLines);
}
