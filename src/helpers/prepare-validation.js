import fastJson from 'fast-json-stringify';

import isHttpCode from './is-http-code';

const validationMethods = [
  'response',
  'query',
  'params',
  'cookies',
  'headers',
  'body'
];
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
  let responseSchema;

  if (schema) {
    validationMethods.forEach((type) => {
      const _schema = schema[type];
      if (typeof _schema === 'object' && _schema) {
        if (type === 'response') {
          const isHttpCodes = Object.keys(_schema).every(isHttpCode);

          const newSchema = {};
          if (isHttpCodes) {
            for (const code in _schema) {
              newSchema[code] = fastJson(_schema[code]);
            }
          } else {
            newSchema[type] = fastJson(_schema);
          }
          responseSchema = newSchema;
        } else {
          if (!ajv) {
            config.setAjv();
            ajv = config.ajv;
          }
          const validator = ajv.compile(_schema);
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
    validationStringify,
    responseSchema
  };
};
