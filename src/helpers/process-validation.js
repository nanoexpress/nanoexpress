export default (req, res, config, { validationStringify, validation } = {}) => {
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
