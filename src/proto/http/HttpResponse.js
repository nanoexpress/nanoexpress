import sendFile from '../../helpers/send-file';

import * as HttpResponseChunks from './response-chunks';

import HttpCookieResponse from './HttpCookieResponse';
import HttpHeaderResponse from './HttpHeaderResponse';
import HttpResponsePolyfill from './HttpResponsePolyfill';

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
