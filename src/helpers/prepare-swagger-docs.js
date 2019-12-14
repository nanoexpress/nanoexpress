import isHttpCode from './is-http-code.js';

const swaggerPathNormalizeRegExp = /:(.*?[/])?(.*)/;
const swaggerPathNormalizeFunc = (matched) => {
  if (matched[0] === ':') {
    matched = matched.substr(1);

    let lastChar = '';
    if (matched && matched[matched.length - 1] === '/') {
      matched = matched.substr(0, matched.length - 1);
      lastChar = '/';
    }

    matched = '{' + matched + '}' + lastChar;
  }
  return matched;
};

export default function swaggerDocsGenerator(
  swaggerDef,
  path,
  method,
  { schema, contentType = '*', ...routeConfigs } = {}
) {
  if (!schema) {
    return;
  }
  if (swaggerDef.paths === undefined) {
    swaggerDef.paths = {};
  }

  if (path.indexOf(':') !== -1) {
    path = path.replace(swaggerPathNormalizeRegExp, swaggerPathNormalizeFunc);
  }

  for (const typeName in schema) {
    if (schema[typeName] === false) {
      continue;
    }

    const type =
      typeName === 'params'
        ? 'path'
        : typeName === 'response'
          ? 'responses'
          : typeName === 'body'
            ? 'requestBody'
            : typeName;

    if (swaggerDef.paths[path] === undefined) {
      swaggerDef.paths[path] = {};
    }

    const defPath = swaggerDef.paths[path];
    if (defPath[method] === undefined) {
      defPath[method] = routeConfigs;
    }

    const methodInstance = defPath[method];

    let schemaItem = schema[typeName];
    const schemaKeys = Object.keys(schemaItem).every(isHttpCode);

    if (typeName === 'security') {
      methodInstance[typeName] = schema[typeName];
      continue;
    } else if (
      typeName === 'query' ||
      typeName === 'params' ||
      typeName === 'headers'
    ) {
      if (!methodInstance.parameters) {
        methodInstance.parameters = [];
      }
      if (schemaItem.description && !methodInstance.description) {
        methodInstance.description = schemaItem.description;
      }
      for (const name in schemaItem.properties) {
        const value = schemaItem.properties[name];

        methodInstance.parameters.push({
          name,
          in: type,
          description: value.description,
          required:
            value.required ||
            (schemaItem.required && schemaItem.required.indexOf(name) !== -1),
          schema: value
        });
      }
      continue;
    } else if (!schemaKeys && typeName === 'response') {
      schema[typeName] = { 200: schemaItem };
    }
    schemaItem = schema[typeName];

    if (!schemaItem.content) {
      if (typeName === 'response') {
        for (const httpCode in schema[typeName]) {
          let value = schema[typeName][httpCode];
          let parent = value;

          if (!value.content) {
            schema[typeName][httpCode] = { content: { [contentType]: value } };
            parent = schema[typeName][httpCode];
            value = parent.content[contentType];
          }
          if (value.description && !parent.description) {
            parent.description = value.description;
          }

          if (!value.schema) {
            schema[typeName][httpCode].content[contentType] = { schema: value };
          }
        }
      } else {
        let value = schemaItem;
        let parent = value;

        if (!value.content) {
          schema[typeName] = { content: { [contentType]: value } };
          parent = schema[typeName];
          value = schema[typeName].content[contentType];
        }
        if (value.description && !parent.description) {
          parent.description = value.description;
        }

        if (!value.schema) {
          schema[typeName].content[contentType] = { schema: value };
        }
      }
    }

    methodInstance[type] = schema[typeName];
  }
}
