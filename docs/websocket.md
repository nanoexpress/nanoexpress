# WebSocket

Performance tip: _Using `schema` option may improve safety by validating messages and gives you auto-parsing of messages_

## Just example

```js
app.ws('/', (req, ws) => {
  console.log('Connected');

  ws.on('message', (message) => {
    console.log('Message received', message);
  });
});
```

## Schema example

Note: _This option gives you better safety with validating messages_

Note 2: _This option auto-parses JSON-strings such as Array and Objects which may be helpful_

```js
app.ws(
  '/',
  {
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        action: { type: 'string' }
      }
    }
  },
  (req, ws) => {
    ws.on('message', ({ type, action }) => {
      ws.send(
        JSON.stringify({
          state: 'send-back',
          type,
          action
        })
      );
    });
  }
);
```

[&laquo; Middlewares](./middlewares.md)

[Routes &raquo;](./routes.md)
