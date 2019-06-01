import * as HttpCookieResponseChunks from './cookie-chunks';

const HttpCookieResponse = {
  ...HttpCookieResponseChunks
};

// Alias for Express users
HttpCookieResponse.cookie = HttpCookieResponse.setCookie;

export default HttpCookieResponse;
