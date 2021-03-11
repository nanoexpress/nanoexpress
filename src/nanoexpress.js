import uWS from 'uWebSockets.js';
import App from './App.js';
import Config from './Config.js';
import Route from './Route.js';

const nanoexpress = (options = {}) => {
  let app;

  if (options.https && options.isSSL !== false) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }
  // App configuration
  const config = new Config(options);

  // Initialize Route instance
  const routeInstance = new Route(config);
  routeInstance._app = app;
  routeInstance._rootLevel = true;

  // Initialize App instance
  return new App(config, app, routeInstance);
};

export { nanoexpress as default };
