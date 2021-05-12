const validationMethods = ['query', 'params', 'cookies', 'headers', 'body'];

export default (ajv, schema) => {
  const validation = [];

  if (schema) {
    for (let i = 0, len = validationMethods.length, type; i < len; i += 1) {
      type = validationMethods[i];
      const _schema = schema[type];
      if (typeof _schema === 'object' && _schema) {
        if (ajv) {
          const validator = ajv.compile(_schema);
          validation.push({ type, validator, schema: _schema });
        }
      }
    }
  }

  return validation;
};
