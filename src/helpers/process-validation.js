export default (req, res, config, { validationStringify, validation } = {}) => {
  if (validationStringify) {
    let errors;
    for (let i = 0, len = validation.length; i < len; i++) {
      const { type, validator } = validation[i];

      const reqValue = req[type];

      if (reqValue === undefined) {
        if (!errors) {
          errors = {
            type: 'errors',
            errors: { [type]: ['value is not defined'] }
          };
        } else {
          const _errors = errors.errors;

          if (_errors[type]) {
            _errors[type].push('value is not defined');
          } else {
            _errors[type] = ['value is not defined'];
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

    if (errors && !res.aborted) {
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
