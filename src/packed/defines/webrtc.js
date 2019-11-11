// Code was used from
// https://flaviocopes.com/webrtc/
// thank you

module.exports = (app) => {
  app.webrtc = (path = '/webrtc', options = {}, ajv) => {
    const connections = {};

    app.ws(
      path,
      options,
      (req, ws) => {
        ws.on(
          'message',
          ({ action, error, credentials: { id, targetId } = {}, payload }) => {
            switch (action) {
            case 'register': {
              if (connections[id] !== null) {
                ws.send(
                  JSON.stringify({ action: 'register', success: false })
                );
              } else {
                connections[id] = { id, ws };
                ws.id = id;

                ws.send(
                  JSON.stringify({ action: 'register', success: true })
                );
              }
              break;
            }
            case 'offer': {
              const connection = connections[targetId];

              if (connection !== null) {
                connection.targetId = targetId;

                connections.ws.send(
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
              const connection = connections[targetId];

              if (connection !== null) {
                connection.targetId = targetId;

                connection.ws.send(
                  JSON.stringify({
                    action,
                    payload
                  })
                );
              }
              break;
            }
            case 'close': {
              const connection = connections[targetId];

              if (connection !== null) {
                connection.ws.send(JSON.stringify({ action: 'close' }));

                connection.ws = null;
                connection.id = null;
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
          const connection = connections[ws.id];

          if (connection !== null) {
            connections[connection.id] = null;
            delete connections[connection.id];

            const targetConnection = connections[connections.targetId];

            if (targetConnection !== null) {
              targetConnection.send(JSON.stringify({ action: 'close' }));
              connections[connections.targetId] = null;
              delete connections[connections.targetId];
            }
          }
        });
      },
      ajv
    );

    return app;
  };
};
