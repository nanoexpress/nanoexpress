// Code was used from
// https://flaviocopes.com/webrtc/
// thank you

module.exports = (app) => {
  app.webrtc = (path = '/webrtc', options = {}, ajv) => {
    const connections = {};

    app.ws(
      path,
      options,
      (ws) => {
        ws.on(
          'message',
          ({
            action,
            error,
            credentials: { id, targetId },
            payload: { offer, answer, candidate }
          }) => {
            switch (action) {
            case 'register': {
              if (connections[id] !== null) {
                ws.send({ action: 'register', success: false });
              } else {
                connections[id] = { id, ws };
                ws.id = id;

                ws.send({ action: 'register', success: true });
              }
              break;
            }
            case 'offer': {
              const connection = connections[targetId];

              if (connection !== null) {
                connection.targetId = targetId;

                connections.ws.send({
                  action: 'offer',
                  credentials: { sourceId: connection.id },
                  payload: { offer }
                });
              }
              break;
            }
            case 'answer': {
              const connection = connections[targetId];

              if (connection !== null) {
                connection.targetId = targetId;

                connection.ws.send({
                  action: 'answer',
                  payload: { answer }
                });
              }
              break;
            }
            case 'candidate': {
              const connection = connections[targetId];

              if (connection !== null) {
                connection.ws.send({
                  action: 'candidate',
                  payload: { candidate }
                });
              }
              break;
            }
            case 'close': {
              const connection = connections[targetId];

              if (connection !== null) {
                connection.ws.send({ action: 'close' });

                connection.ws = null;
                connection.credentials = null;
                connections.payload = null;
              }
              break;
            }
            default: {
              ws.send({
                action: 'error',
                error: error || `action[${action}] not found`
              });
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
              targetConnection.send({ action: 'close' });
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
