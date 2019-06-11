import fastJson from 'fast-json-stringify';

const validationMethods = ['response', 'query', 'params', 'headers', 'body'];
const validationSchema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    errors: {
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
    }
  }
};

export default (ajv, schema, config) => {
  const validation = [];
  let validationStringify;
  if (schema) {
    validationMethods.forEach((type) => {
      const _schema = schema[type];
      if (typeof _schema === 'object' && _schema) {
        if (type === 'response') {
          schema[type] = fastJson(_schema);
        } else {
          if (!ajv) {
            config.setAjv();
            ajv = config.ajv;
          }
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
