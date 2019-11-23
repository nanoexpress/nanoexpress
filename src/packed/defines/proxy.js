import http from 'http';
import https from 'https';

http.globalAgent.keepAlive = true;
https.globalAgent.keepAlive = true;

export default (app) => {
  const disallowedHeaders = [
    'Host',
    'Content-Length',
    'uWebSockets'
  ].map((header) => header.toLowerCase());
  app.proxy = (path, { url, method, enableHeadersProxy = false } = {}) => {
    const isAny = method === undefined;
    const proxyPathLen = path.length;
    const isHttps = url.indexOf('https') === 0;

    if (method) {
      method = method.toLowerCase();
    }

    const request = isHttps ? https : http;

    // Config settings
    const config = {
      url,
      method,
      headers: {}
    };

    const proxyHandler = (fetchUrl) => (res, req) => {
      if (isAny) {
        config.method = req.getMethod();
      }
      if (fetchUrl) {
        config.url += req.getUrl().substr(proxyPathLen);
      }

      let isAborted = false;

      if (enableHeadersProxy) {
        req.forEach((key, value) => {
          if (disallowedHeaders.indexOf(key) === -1) {
            config.headers[key] = value;
          }
        });
      } else {
        config.headers.connection = req.getHeader('connection');
      }

      res.onAborted(() => {
        isAborted = true;
      });

      return new Promise((resolve) =>
        request[config.method](config.url, config, (response) => {
          const { headers: responseHeaders } = response;

          if (isAborted) {
            return;
          }

          if (enableHeadersProxy) {
            for (const key in responseHeaders) {
              const value = responseHeaders[key];

              if (disallowedHeaders.indexOf(key) !== -1) {
                continue;
              }

              if (typeof value === 'string') {
                res.writeHeader(key, value);
              } else if (value.splice) {
                for (let i = 0, len = value.length; i < len; i++) {
                  res.writeHeader(key, value[i]);
                }
              }
            }
          }

          let buff;
          response.on('data', (chunk) => {
            if (isAborted) {
              return;
            } else if (!buff) {
              buff = Buffer.from(chunk);
            } else {
              buff = Buffer.concat([buff, chunk]);
            }
          });
          response.on('end', () => {
            res.end(buff);
            resolve();
          });
        })
      );
    };

    app._app[isAny ? 'any' : method](`${path}`, proxyHandler(false));
    app._app[isAny ? 'any' : method](`${path}/*`, proxyHandler(true));
    return app;
  };
};
