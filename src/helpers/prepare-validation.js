import fastJson from 'fast-json-stringify';

const validationMethods = ['response', 'query', 'params', 'headers', 'body'];
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
  if (ajv) {
    validationMethods.forEach((type) => {
      const _schema = schema[type];
      if (typeof _schema === 'object') {
        if (type === 'response') {
          schema[type] = fastJson(_schema);
        } else {
          const validator = ajv.compile(_schema);
          schema[type] = validator;
          validation.push({ type, validator });
          if (!validationStringify) {
            validationStringify = fastJson(validationSchema);
          }
        }
      }
    });
  }
  return {
    validation,
    validationStringify
  };
};
