const { absolutePath } = require('swagger-ui-dist');

module.exports = (config = {}) => {
  if (config.title === undefined) {
    config.title = 'nanoexpress - Swagger UI';
  }
  if (config.path === undefined) {
    config.path = '/docs/';
  }
  if (config.fsPath === undefined) {
    config.fsPath = absolutePath();
  }
  return (req, res, next) => {
    if (config.url === undefined) {
      config.url = `http://${req.getHeader('host')}/docs/swagger.json`;
    }

    if (req.path.indexOf('/swagger-ui') === 0) {
      res.sendFile(`${config.fsPath}${req.path}`);
    } else if (req.path === config.path) {
      res.end(`
      <!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${config.title}</title>
<link rel="stylesheet" type="text/css" href="./swagger-ui.css" >
    <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body
      {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>

  <body>
    <div id="swagger-ui"></div>

    <script src="./swagger-ui-bundle.js"> </script>
    <script src="./swagger-ui-standalone-preset.js"> </script>
    <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        url: "${config.url}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      })
      // End Swagger UI call region

      window.ui = ui
    }
  </script>
  </body>
</html>      `);
    } else {
      next(null, true);
    }
  };
};
