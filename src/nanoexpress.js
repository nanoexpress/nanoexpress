import uWS from 'uWebSockets.js';

import Route from './Route';
import App from './App';
import Config from './Config';

const nanoexpress = (options = {}) => {
  let app;

  if (options.https) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }
  // App configuration
  const config = new Config(options);

  // Initialize Route instance
  const routeInstance = new Route(config, config.ajv);

  // Initialize App instance
  return new App(config, app, routeInstance);
};

export { nanoexpress as default };
