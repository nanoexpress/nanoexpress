import responseMethods from '../proto/http/HttpResponse.js';

const nonSimpleProps = ['params', 'query', 'cookies', 'body'].map(
  (prop) => `req.${prop}`
);
const nonSimpleMethods = Object.keys(responseMethods).map(
  (method) => `res.${method}`
);

const HEADER_KEY_REGEX = /[;()]/g;
const RETURN_TRIP_REGEX = /;/g;
const CONTENT_SPACE_TRIM_REGEX = /\s+/g;
const ARGUMENTS_MATCH_REG_EX = /\((req|res)\)/;
const DIRECT_SIMPLE_ASYNC_REG_EX = /async?\s+\((.*)\)\s+=>?\s+(.*)/g;

export default function compileRoute(fn) {
  const content = fn.toString().trim();

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
  if (returnLine && returnLine.includes('return')) {
    const tripLeft = returnLine.trim().substr(7);
    returnLine = `res.end(${tripLeft.replace(RETURN_TRIP_REGEX, '')})`;
  }

  let contentLines = argumentsLine + '\n';

  if (lines.length > 0) {
    for (const line of lines) {
      if (line.includes('//')) {
        continue;
      }

      const headerKeyIndex = line.indexOf('req.headers');
      if (headerKeyIndex !== -1) {
        const headerKey = line
          .substr(headerKeyIndex + 12)
          .replace(HEADER_KEY_REGEX, '');

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
