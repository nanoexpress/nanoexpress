import { http } from '../wrappers';
import { prepareValidation } from '../helpers';

export default (path, fn, config, { schema } = {}, ajv) => {
  // For easier aliasing
  const { validation, validationStringify } = prepareValidation(ajv, schema);

  return async (res, req) => {
    // Crash handling
    res.onAborted(() => {
      res.aborted = true;
    });

    // For future usage
    req.rawPath = path;

    let request;

    // Don't run `await` immediately for small performance gain
    if (res.onData) {
      request = await http.request(req, res, config);
    } else {
      request = http.request(req, res, config);
    }

    if (validationStringify) {
      let errors;
      for (let i = 0, len = validation.length; i < len; i++) {
        const { type, validator } = validation[i];

        const valid = validator(req[type]);

        if (!valid) {
          if (!errors) {
            errors = [
              { type, messages: validator.errors.map((err) => err.message) }
            ];
          } else {
            errors.push({
              type,
              messages: validator.errors.map((err) => err.message)
            });
          }
        }
      }

      if (errors && !res.aborted) {
        return res.end(validationStringify(errors));
      }
    }

    const response = http.response(res, req, config, schema && schema.response);

    const result = await fn(request, response, config);

    if (result && !result.stream && !res.aborted) {
      res.send(result);
    }
  };
};
