import * as HttpCookieResponseChunks from './cookie-chunks/index.js';

const HttpCookieResponse = {
  ...HttpCookieResponseChunks
};

// Alias for Express users
HttpCookieResponse.cookie = HttpCookieResponse.setCookie;

export default HttpCookieResponse;
