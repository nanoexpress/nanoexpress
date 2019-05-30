import fastJson from 'fast-json-stringify';

const validationMethods = ['query', 'params', 'headers', 'body'];
const validationSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      messages: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  }
};

export default (ajv, schema) => {
  const validation = [];
  let validationStringify;
  if (typeof schema === 'object' && schema) {
    if (typeof schema.response === 'object') {
      schema.response = fastJson(schema.response);
    }
    if (ajv) {
      validationMethods.forEach((type) => {
        const _schema = schema[type];
        if (typeof _schema === 'object') {
          const validator = ajv.compile(_schema);
          schema[type] = validator;
          validation.push({ type, validator });
        }
      });
      if (validation.length > 0) {
        validationStringify = fastJson(validationSchema);
      }
    }
  }
  return {
    validation,
    validationStringify
  };
};
