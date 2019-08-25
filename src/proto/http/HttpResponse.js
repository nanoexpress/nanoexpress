import sendFile from '../../helpers/send-file.js';

import * as HttpResponseChunks from './response-chunks/index.js';

import HttpCookieResponse from './HttpCookieResponse.js';
import HttpHeaderResponse from './HttpHeaderResponse.js';
import HttpResponsePolyfill from './HttpResponsePolyfill.js';

const HttpResponse = {
  ...HttpHeaderResponse,
  ...HttpCookieResponse,
  ...HttpResponseChunks,
  ...HttpResponsePolyfill
};

// Aliases for beginners and/or users from Express!
HttpResponse.json = HttpResponse.send;

// Add stream feature by just method
// for easy and clean code
HttpResponse.sendFile = sendFile;

export default HttpResponse;
