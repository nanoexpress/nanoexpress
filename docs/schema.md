# Schema

Performance tip: _If you correctly and exactly define the schema, your app will be faster by 25-30% which is good and validation support will be out-of-the-box_

**Note**: _For to be it's working, please install [Ajv](http://ajv.js.org) module yourself, it's in our library in `peerDependencies`_

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

**Note**: _For to be better performance and working serialization, please install [fast-json-stringify](https://github.com/fastify/fast-json-stringify) module yourself, it's in our library in `peerDependencies`_

- `response`
- `response.HTTP_CODE`

We use [fast-json-stringify](https://github.com/fastify/fast-json-stringify) under the hood for serialization and improving response time (applies for `Array` and `Object`)

Performance tip #2: _If you don't want use, please set it to `false` for performance reason_

Note: _If schema is wrong, error is not causing, it just removes that value from response which may be bad for your application, so, please be careful then typing schema_

Note #2: _If `required` property was used and value isn't returned, server may crash or performance may drops by 5-10x, please, try to make sure everything is correct on your schema_

Note #3: _You can see discussion about this [here](https://github.com/fastify/fast-json-stringify/issues/169) and [here](https://github.com/fastify/fast-json-stringify/pull/172), you can submit PR with your solution. Your PR may helps to improve this library and other ~2K app performance_

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

#### or HTTP Code-based serialization

```js
app.get(
  '/',
  {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            status: { type: 'string' }
          }
        }
      }
    }
  },
  async () => ({ hello: 'world' })
);

app.listen(4000);
```

[&laquo; Static Serve](./static-serve.md)

[TypeScript &raquo;](./typescript.md)
