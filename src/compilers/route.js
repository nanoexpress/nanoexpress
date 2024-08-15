import http from 'node:http';
import responseMethods from '../response-proto/http/HttpResponse.js';

const nonSimpleProps = [
  'query',
  'cookies',
  'body',
  'pipe',
  'stream',
  'getIP'
].map((prop) => `req.${prop}`);
const matchers = (raw, prop) =>
  raw.includes(`.${prop}`) ||
  raw.includes(`{ ${prop}`) ||
  raw.includes(`${prop} }`) ||
  raw.includes(`, ${prop}`) ||
  raw.includes(`${prop},`);

const allowedMethods = ['status', 'setHeader'];
const nonSimpleMethods = Object.keys(responseMethods)
  .filter((method) => !allowedMethods.includes(method))
  .map((method) => `res.${method}`);

// eslint-disable-next-line no-useless-escape
const HEADER_PARAM_KEY_REGEX = /['"`;(){}\[\]]/g;
const HEADER_PARAM_KEY_CONST_REGEX = /(\{(.*)\})?\s+?=?\s+req./m;
const RETURN_TRIP_REGEX = /;/g;
const ARGUMENTS_MATCH_REG_EX = /\((req|res)\)/;
const DIRECT_SIMPLE_ASYNC_REG_EX = /async?\s+\((.*)\)\s+=>?\s+(.*)/g;

const convertParams = (params) => {
  if (!params) {
    return null;
  }
  const _params = {};
  for (let i = 0, len = params.length; i < len; i += 1) {
    _params[params[i]] = i;
  }
  return _params;
};
const babelCompilerManipulationNormalize = (content) => {
  if (content.includes('const {\n') || content.includes('let {\n')) {
    return content.split('\n').reduce((_all, _currLine, index) => {
      let all = _all;
      let currLine = _currLine;

      if (currLine.includes('{') && index > 0) {
        all += '\n';
      }
      if (index > 0 && (currLine.includes(';') || currLine.includes('}'))) {
        currLine += '\n';
      }

      return all + currLine;
    }, '');
  }
  return content;
};

export default function compileRoute(fn, params) {
  /** @type {string} */
  const content = babelCompilerManipulationNormalize(fn.toString().trim());
  const preparedParams = convertParams(params);

  // Don't parse dummy functions
  if (content === '() => {}') {
    return (_, res) => res.end('');
  }

  /** @type {string[]} */
  const lines = content.split('\n');

  /** @type {string} */
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
  } else if (lines.length <= 2) {
    let isComment = false;
    let isEnd = false;
    let otherCommands = false;

    for (const line of lines) {
      if (line.trim().startsWith('//')) {
        isComment = true;
      } else if (line.trim().endsWith('}')) {
        isEnd = true;
      } else {
        otherCommands = true;
      }
    }

    // Fast approx match empty routes and handlers
    if (isComment && isEnd && !otherCommands) {
      return (_, res) => res.end('');
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

  let isAwait = false;
  let isCorked = false;

  if (argumentsLine.includes('async') && !content.includes('await')) {
    argumentsLine = argumentsLine.substr(5);
  } else if (
    argumentsLine.includes('async') &&
    content.includes('await') &&
    !content.includes('// await')
  ) {
    argumentsLine += `
    let $$aborted = false;
    res.onAborted(() => {
      $$aborted = true;
  })`;
    isAwait = true;
  }

  if (!argumentsLine.includes('(req, res)')) {
    if (argumentsLine.includes('(req)') || argumentsLine.includes('(res)')) {
      argumentsLine = argumentsLine.replace(
        ARGUMENTS_MATCH_REG_EX,
        '(res, res)'
      );
    } else {
      argumentsLine = `(res, res)${argumentsLine.substr(
        argumentsLine.indexOf('()') + 2
      )}`;
    }
    if (isAwait) {
      argumentsLine = `async ${argumentsLine}`;
    }
  } else {
    argumentsLine = argumentsLine.replace('(req, res)', '(res, req)');
  }

  if (returnLine === '}' && lines.length > 0) {
    buffyReturnLine = returnLine;
    returnLine = lines.pop();
  }

  if (returnLine) {
    if (returnLine.includes('return') && !returnLine.includes('end(')) {
      const tripLeft = returnLine.trim().substr(7);
      returnLine = `res.end(${tripLeft.replace(RETURN_TRIP_REGEX, '')})`;

      returnLine = `res.end(${tripLeft.replace(RETURN_TRIP_REGEX, '')})`;
    }
    if (returnLine.includes('(({')) {
      returnLine = returnLine.replace(/\(\(/g, '(');
    }
    if (returnLine.includes('}))')) {
      returnLine = returnLine.replace(/\)\)/g, ')');
    }
    if (returnLine.includes('({')) {
      returnLine = returnLine.replace(
        /res\.end\((.*)\)/g,
        'res.end(JSON.stringify($1))'
      );
    }
  }

  let contentLines = `${argumentsLine}\n`;

  const assumeCorked = () => {
    if (!isCorked) {
      contentLines += 'res.cork(() => {\n';
      returnLine += '\n});\n';
      isCorked = true;
    }
  };
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
              `req.headers.${headerKey}`,
              `req.getHeader('${headerKey}')`
            );
          } else if (line.charAt(headerKeyIndex + 11) === '[') {
            contentLines += line.replace(
              `req.headers['${headerKey}']`,
              `req.getHeader('${headerKey}')`
            );
          } else if (line.includes('req.headers;')) {
            const matchDefine = line.includes('const') ? 'const' : 'let';
            const extractConstants = line.match(HEADER_PARAM_KEY_CONST_REGEX);
            const leftPad = line.indexOf(matchDefine);

            if (extractConstants?.[2]) {
              const constants = extractConstants[2].trim().split(',');

              for (const header of constants) {
                contentLines += `${' '.repeat(
                  leftPad
                )}${matchDefine} ${header} = req.getHeader('${header}');`;
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
              `req.params.${paramKey}`,
              `req.getParameter('${paramIndex}')`
            );
          } else if (line.charAt(paramKeyIndex + 10) === '[') {
            contentLines += line.replace(
              `req.params['${paramKey}']`,
              `req.getParameter('${paramIndex}')`
            );
          } else if (line.includes('req.params;')) {
            const matchDefine = line.includes('const') ? 'const' : 'let';
            const extractConstants = line.match(HEADER_PARAM_KEY_CONST_REGEX);
            const leftPad = line.indexOf(matchDefine);

            if (extractConstants?.[2]) {
              const constants = extractConstants[2].trim().split(',');

              for (const param of constants) {
                contentLines += `${' '.repeat(
                  leftPad
                )}${matchDefine} ${param} = req.getParameter(${
                  preparedParams[param]
                });`;
              }
            }
          } else {
            return null;
          }
        }
      } else if (line.includes('setHeader')) {
        assumeCorked();
        contentLines += line.replace('setHeader', 'writeHeader');
      } else if (line.includes('status(')) {
        assumeCorked();
        const statusPrepare = line.substr(line.indexOf('status(') + 7);
        const code = Number.parseInt(
          statusPrepare.substr(0, statusPrepare.indexOf(')')),
          10
        );

        if (typeof code === 'number' && !Number.isNaN(code)) {
          contentLines += line
            .replace('status', 'writeStatus')
            .replace(code, `'${code} ${http.STATUS_CODES[code]}'`);
        } else {
          contentLines += line;
        }
      } else {
        contentLines += line;
      }

      contentLines += '\n';
    }
  }

  if (isAwait) {
    contentLines += `
    if ($$aborted) {
      return;
    }
    `;
  }

  assumeCorked();

  if (returnLine) {
    contentLines += returnLine;
  }

  if (buffyReturnLine) {
    contentLines += '\n';
    contentLines += buffyReturnLine;
  }

  let compiled;
  try {
    compiled = new Function(`return ${contentLines}`)();
  } catch {
    try {
      // biome-ignore lint/security/noGlobalEval: <explanation>
      compiled = eval(contentLines);
    } catch {
      compiled = null;
    }
  }

  if (compiled) {
    compiled.path = matchers(contentLines, 'path');
    compiled.method = matchers(contentLines, 'method');
    compiled.isCompiled = true;
  }

  return compiled;
}
