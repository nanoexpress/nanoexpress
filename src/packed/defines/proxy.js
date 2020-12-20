import http from 'http';
import https from 'https';

http.globalAgent.keepAlive = true;
https.globalAgent.keepAlive = true;

const httpRequest = (agent, url, config) =>
  new Promise((resolve, reject) => {
    agent[config.method](url, config, (response) => {
      let buff;
      response.on('data', (chunk) => {
        chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

        if (!buff) {
          buff = chunk;
        } else {
          buff = Buffer.concat([buff, chunk]);
        }
      });
      response.on('end', () => {
        response.data = buff;

        resolve(response);
      });
      response.on('error', reject);
    });
  });

const prepareProxy = (
  path,
  {
    url,
    method,
    enableHeadersProxy = false,
    restrictedHeaders = [
      'Host',
      'Content-Length',
      'uWebSockets',
      'Accept-Encoding'
    ]
  } = {},
  WebsocketInstance
) => {
  const isAny = method === undefined;
  const fetchUrl = url.indexOf('*') !== -1 || url.indexOf(':') !== -1;
  const proxyPathLen = fetchUrl ? path.length : 0;
  const disallowedHeaders = restrictedHeaders.map((header) =>
    header.toLowerCase()
  );

  // Prepared object to return
  const prepared = {
    isAny
  };

  const ssl = url.indexOf('https:') === 0;
  const agent = ssl ? https : http;

  if (method) {
    method = method.toLowerCase();
  }

  // HTTP Request configuration
  const config = {
    url,
    method,
    headers: {}
  };

  prepared.method = isAny ? 'any' : method;
  prepared.http = async (res, req) => {
    // Allow waiting for request finishing
    let isAborted = false;
    res.onAborted(() => {
      isAborted = true;
    });

    // Fetch needed methods and configure
    const httpUrl = fetchUrl ? url + req.getUrl().substr(proxyPathLen) : url;

    config.method = isAny ? req.getMethod() : method;

    // Proxy headers too if it's defined
    if (enableHeadersProxy) {
      req.forEach((key, value) => {
        if (disallowedHeaders.indexOf(key) === -1) {
          config.headers[key] = value;
        }
      });
    }

    const { data, headers } = await httpRequest(agent, httpUrl, config);

    if (isAborted) {
      return;
    }

    res.cork(() => {
      if (isAborted) {
        return;
      }

      if (enableHeadersProxy) {
        for (const key in headers) {
          const value = headers[key];

          if (disallowedHeaders.indexOf(key) !== -1) {
            continue;
          }

          if (typeof value === 'string') {
            res.writeHeader(key, value);
          } else if (value.splice) {
            for (let i = 0, len = value.length; i < len; i += 1) {
              res.writeHeader(key, value[i]);
            }
          }
        }
      }

      res.end(data);
    });
  };
  if (WebsocketInstance) {
    prepared.ws = {
      open(ws, req) {
        config.method = 'ws';

        const wsUrl =
          url.replace(/http/, 'ws') +
          (fetchUrl ? req.getUrl().substr(proxyPathLen) : '');

        ws.instance = new WebsocketInstance(wsUrl);

        ws.instance.on('message', (data) => {
          ws.send(data);
        });

        ws.instance.emit('open');
      },
      message(ws, message, isBinary) {
        if (!isBinary) {
          message = Buffer.from(message).toString('utf8');
        }

        ws.instance.send(message);
      },
      close(ws, code, reason) {
        ws.instance.close(code, reason);
      }
    };
  }

  return prepared;
};

export default (app) => {
  app.proxy = (path, config, wsInstance) => {
    const { ws, http: httpHandler, method } = prepareProxy(
      path,
      config,
      wsInstance
    );

    if (httpHandler) {
      app._app[method](path, httpHandler);
    }
    if (ws) {
      app._app.ws(path, ws);
    }
    return app;
  };
};
