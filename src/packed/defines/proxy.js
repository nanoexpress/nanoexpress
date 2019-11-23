import http from 'http';
import https from 'https';

export default (app) => {
  const disallowedHeaders = [
    'host',
    'connection',
    'content-length',
    'uwebsockets'
  ];
  app.proxy = (path, { url, method } = {}) => {
    const isAny = method === undefined;
    const proxyPathLen = path.length;
    const isHttps = url.indexOf('https') === 0;

    if (method) {
      method = method.toLowerCase();
    }

    const request = isHttps ? https : http;

    const proxyHandler = (res, req) => {
      const reqMethod = req.getMethod();
      const reqUrl = req.getUrl();
      const normalizeRreqUrl = reqUrl.substr(proxyPathLen);

      let isAborted = false;
      let isDone = false;
      let lastOffset;
      let lastBuffer;

      const headers = {};

      req.forEach((key, value) => {
        if (disallowedHeaders.indexOf(key) === -1) {
          headers[key] = value;
        }
      });

      res.onAborted(() => {
        isAborted = true;
      });
      request[reqMethod.toLowerCase()](
        url + normalizeRreqUrl,
        {
          headers
        },
        (response) => {
          const totalSize = +response.headers['content-length'];
          const { headers: responseHeaders } = response;

          for (const header in responseHeaders) {
            const value = responseHeaders[header];

            if (isDone || isAborted) {
              break;
            }
            if (disallowedHeaders.indexOf(header) !== -1) {
              continue;
            }
            if (value.splice) {
              for (const headerItem of value) {
                res.writeHeader(header, headerItem);
              }
            } else {
              res.writeHeader(header, value);
            }
          }

          response.on('data', (chunk) => {
            /* We only take standard V8 units of data */
            const buffer = Buffer.from(chunk);

            if (isAborted) {
              return;
            }
            /* Store where we are, globally, in our response */
            const getLastOffset = res.getWriteOffset();

            /* Streaming a chunk returns whether that chunk was sent, and if that chunk was last */
            const [ok, done] = res.tryEnd(buffer, totalSize);

            /* Did we successfully send last chunk? */
            if (done) {
              isDone = true;
            } else if (!ok) {
              /* Save unsent chunk for when we can send it */
              lastBuffer = buffer;
              lastOffset = getLastOffset;

              /* Register async handlers for drainage */
              res.onWritable((offset) => {
                /* Here the timeout is off, we can spend as much time before calling tryEnd we want to */

                /* On failure the timeout will start */
                const [ok, done] = res.tryEnd(
                  lastBuffer.slice(offset - lastOffset),
                  totalSize
                );
                if (done) {
                  isDone = true;
                } else if (ok) {
                  /* We sent a chunk and it was not the last one, so let's resume reading.
                   * Timeout is still disabled, so we can spend any amount of time waiting
                   * for more chunks to send. */
                  // response.resume();
                }

                /* We always have to return true/false in onWritable.
                 * If you did not send anything, return true for success. */
                return isDone ? undefined : isAborted ? false : ok;
              });
            }
          });
        }
      );
    };

    app._app[isAny ? 'any' : method](`${path}`, proxyHandler);
    app._app[isAny ? 'any' : method](`${path}/*`, proxyHandler);
    return app;
  };
};
