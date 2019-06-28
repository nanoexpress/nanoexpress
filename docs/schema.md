# Schema

Performance tip: _If you correctly and exactly define the schema, your app will be faster by 25-30% which is good and validation support will be out-of-the-box_

## Validation

Note: _All validations are optional_

### Types of validation

- `headers`
- `params`
- `query`
- `body`
- `cookies`

For more information, please look at [Ajv docs](http://ajv.js.org)

Performance tip #2: _If you don't want use any or all (except `body`) of these validation method, please set it to `false` for performance reason_

```js
app.get(
  '/',
  {
    schema: {
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        }
      },
      query: false,
      params: false,
      cookies: false
    }
  },
  async () => ({ hello: 'world' })
);

app.listen(4000);
```

## Serialization

### Types of serialization

- `response`

We use [fast-json-stringify](https://github.com/fastify/fast-json-stringify) under the hood for serialization and improving response time (applies for `Array` and `Object`)

Performance tip #2: _If you don't want use, please set it to `false` for performance reason_

```js
app.get(
  '/',
  {
    schema: {
      response: {
        type: 'object',
        properties: {
          hello: { type: 'string' }
        }
      }
    }
  },
  async () => ({ hello: 'world' })
);

app.listen(4000);
```

[&laquo; Response](./response.md)

[TypeScript &raquo;](./typescript.md)
