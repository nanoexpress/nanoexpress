// Code was used from
// https://flaviocopes.com/webrtc/
// thank you

export default (app) => {
  app.webRTCServer = (path = '/webrtc', options = {}, ajv = null) => {
    const connections = {};

    app.ws(
      path,
      options,
      (req, ws) => {
        ws.on(
          'message',
          ({
            action,
            error,
            credentials: { id, targetId } = {},
            payload = null
          }) => {
            switch (action) {
              case 'register': {
                if (connections[id]) {
                  ws.send(
                    JSON.stringify({ action: 'register', success: false })
                  );
                } else {
                  connections[id] = ws;
                  ws.id = id;

                  ws.send(
                    JSON.stringify({ action: 'register', success: true })
                  );
                }
                break;
              }
              case 'offer': {
                const connection = connections[targetId];

                if (connection) {
                  connection.targetId = ws.id;
                  ws.targetId = targetId;

                  connection.send(
                    JSON.stringify({
                      action,
                      credentials: { sourceId: connection.id },
                      payload
                    })
                  );
                }
                break;
              }
              case 'answer':
              case 'candidate': {
                const connection = connections[ws.targetId];
                if (connection) {
                  connection.send(
                    JSON.stringify({
                      action,
                      payload
                    })
                  );
                }
                break;
              }
              case 'close': {
                const { targetId: wsId } = ws;
                const connection = connections[wsId];

                if (connection) {
                  connection.send(JSON.stringify({ action: 'close' }));
                }
                break;
              }
              default: {
                ws.send(
                  JSON.stringify({
                    action: 'error',
                    error: error || `action[${action}] not found`
                  })
                );
                break;
              }
            }
          }
        );
        ws.on('close', () => {
          const { id, targetId } = ws;

          connections[id] = null;
          delete connections[id];

          ws.id = null;
          ws.targetId = null;
          ws = null;

          const targetConnection = connections[targetId];

          if (targetConnection) {
            targetConnection.send(JSON.stringify({ action: 'close' }));

            // Clean target user too
            connections[targetId] = null;
            delete connections[targetId];
          }
        });
      },
      ajv
    );

    return app;
  };
};
