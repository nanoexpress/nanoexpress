import uWS from 'uWebSockets.js';
import App from './App.js';

function nanoexpress(options = {}) {
  let app;

  if (options.https && options.isSSL !== false) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  // Initialize App instance
  return new App(options, app);
}

// Polyfill for file-upload
nanoexpress.getParts = uWS.getParts;

export default nanoexpress;
