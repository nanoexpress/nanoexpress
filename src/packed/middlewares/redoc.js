module.exports = (config = {}) => {
  if (config.title === undefined) {
    config.title = 'nanoexpress - ReDoc';
  }
  if (config.path === undefined) {
    config.path = '/docs/';
  }
  return (req, res, next) => {
    if (config.url === undefined) {
      config.url = `http://${req.getHeader('host')}/docs/swagger.json`;
    }

    if (req.path === config.path) {
      res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${config.title}</title>
        <!-- needed for adaptive design -->
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="shortcut icon"
          type="image/x-icon"
          href="https://quizizz.com/favicon.ico"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700"
          rel="stylesheet"
          async
        />

        <!--
        ReDoc doesn't change outer page styles
        -->
        <style>
          body {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <redoc
          spec-url="${config.url}"
          expand-responses="all"
        ></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js" async></script>
      </body>
    </html>
    `);
    } else {
      // We call this to avoid POOL response instance
      // If response is POOLED, we will see ERROR and can't respond
      // anything like before, this basically is happening for CPU
      // and memory reduce reason
      if (!res.abortHandler) {
        res.onAborted(() => {
          res.aborted = true;
        });
        res.abortHandler = true;
      }
      next(null, true);
    }
  };
};
