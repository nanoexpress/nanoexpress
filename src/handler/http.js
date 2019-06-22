import { http } from '../wrappers';
import { prepareValidation, isSimpleHandler } from '../helpers';

const bodyDisallowedMethods = ['get', 'options', 'head', 'trace', 'ws'];
export default (path, fn, config, { schema } = {}, ajv, method) => {
  const isSimpleRequest = isSimpleHandler(fn);

  if (isSimpleRequest.simple) {
    return isSimpleRequest.handler;
  }
  // For easier aliasing
  const { validation, validationStringify } = prepareValidation(
    ajv,
    schema,
    config
  );

  const bodyCall = bodyDisallowedMethods.indexOf(method) === -1;

  return async (res, req) => {
    // For future usage
    req.rawPath = path;
    req.method = method;

    if (validationStringify) {
      let errors;
      for (let i = 0, len = validation.length; i < len; i++) {
        const { type, validator } = validation[i];

        const valid = validator(req[type]);

        if (!valid) {
          if (!errors) {
            errors = {
              type: 'errors',
              errors: [
                { type, messages: validator.errors.map((err) => err.message) }
              ]
            };
          } else {
            errors.errors.push({
              type,
              messages: validator.errors.map((err) => err.message)
            });
          }
        }
      }

      if (errors && !res.aborted) {
        if (config._validationErrorHandler) {
          return config._validationErrorHandler(errors, req, res);
        }
        return res.end(validationStringify(errors));
      }
    }

    const request =
      bodyCall && res.onData
        ? await http.request(req, res, bodyCall)
        : http.request(req, res);

    const response = http.response(res, req, config, schema && schema.response);

    if (!fn.async || fn.simple) {
      return fn(request, response, config);
    } else if (!bodyCall && !res.abortHandler) {
      // For async function requires onAborted handler
      res.onAborted(() => {
        if (res.readStream) {
          res.readStream.destroy();
        }
        res.aborted = true;
      });
      res.abortHandler = true;
    }

    if (res.aborted) {
      return undefined;
    }

    const result = await fn(request, response, config);

    if (res.aborted) {
      return undefined;
    }

    if (!result || result.error) {
      if (config._errorHandler) {
        return config._errorHandler(result.error, req, res);
      }
      res.writeHeader('Content-Type', 'text/json');
      return res.end(
        `{"error":"${
          result && result.error
            ? result.message
            : 'The route you visited does not returned response'
        }"}`
      );
    }
    if (!result.stream && method !== 'options') {
      if (typeof result === 'string' && !res.statusCode) {
        res.end(result);
      } else {
        res.send(result);
      }
    }
  };
};
