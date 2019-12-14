import fastJson from 'fast-json-stringify';
import isHttpCode from './is-http-code.js';

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
      type: 'object',
      properties: {
        headers: {
          type: 'array',
          items: { type: 'string' }
        },
        cookies: {
          type: 'array',
          items: { type: 'string' }
        },
        query: {
          type: 'array',
          items: { type: 'string' }
        },
        params: {
          type: 'array',
          items: { type: 'string' }
        },
        body: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  }
};

export default (ajv, schema) => {
  const validation = [];
  let validationStringify;
  let responseSchema;

  if (schema) {
    for (let i = 0, len = validationMethods.length, type; i < len; i++) {
      type = validationMethods[i];
      const _schema = schema[type];
      if (typeof _schema === 'object' && _schema) {
        if (type === 'response') {
          const isHttpCodes = Object.keys(_schema).every(isHttpCode);

          let newSchema;
          if (isHttpCodes) {
            newSchema = {};
            for (const code in _schema) {
              newSchema[code] = fastJson(_schema[code]);
            }
          } else {
            newSchema = fastJson(_schema);
          }

          responseSchema = newSchema;
        } else {
          if (ajv) {
            const validator = ajv.compile(_schema);
            validation.push({ type, validator, schema: _schema });
            if (!validationStringify) {
              validationStringify = fastJson(validationSchema);
            }
          }
        }
      }
    }
  }

  return {
    validation,
    validationStringify,
    responseSchema
  };
};
