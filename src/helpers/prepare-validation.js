import isHttpCode from './is-http-code';

let fastJson;

try {
  fastJson = require('fast-json-stringify');
} catch (e) {
  console.error(
    '[nanoexpress]: `fast-json-stringify` was not found in your dependencies list' +
      ', please install yourself for this feature working properly'
  );
}

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
          if (typeof fastJson !== 'function') {
            console.error(
              '[nanoexpress]: `fast-json-stringify` was not initialized properly'
            );
            return;
          }
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
          } else if (typeof config.configureAjv === 'function') {
            ajv = config.configureAjv(ajv);
          }
          if (ajv) {
            const validator = ajv.compile(_schema);
            validation.push({ type, validator });
            if (!validationStringify) {
              validationStringify = fastJson(validationSchema);
            }
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
