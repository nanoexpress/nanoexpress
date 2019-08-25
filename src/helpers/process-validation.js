export default (req, res, config, { validationStringify, validation } = {}) => {
  if (validationStringify) {
    let errors;
    for (let i = 0, len = validation.length; i < len; i++) {
      const { type, validator, schema } = validation[i];

      const reqValue = req[type];

      if (reqValue === undefined) {
        if (schema && schema.required) {
          if (!errors) {
            errors = {
              type: 'errors',
              errors: { [type]: [type + ' is not missing'] }
            };
          } else {
            const _errors = errors.errors;

            if (_errors[type]) {
              _errors[type].push(type + ' is not missing');
            } else {
              _errors[type] = [type + ' is not missing'];
            }
          }
        }
        continue;
      }

      const valid = validator(reqValue);

      if (!valid) {
        if (!errors) {
          errors = {
            type: 'errors',
            errors: { [type]: validator.errors.map((err) => err.message) }
          };
        } else {
          const _errors = errors.errors;

          if (_errors[type]) {
            _errors[type].push(...validator.errors.map((err) => err.message));
          } else {
            _errors[type] = validator.errors.map((err) => err.message);
          }
        }
      }
    }

    if (errors) {
      if (config._validationErrorHandler) {
        const validationHandlerResult = config._validationErrorHandler(
          errors,
          req,
          res
        );

        if (validationHandlerResult && validationHandlerResult.errors) {
          errors = validationHandlerResult;
        } else {
          return config._validationErrorHandler(errors, req, res);
        }
      }
      return res.end(validationStringify(errors));
    }
  }
};
