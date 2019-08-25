import * as HttpHeaderResponseChunks from './header-chunks/index.js';

const HttpHeaderResponse = {
  ...HttpHeaderResponseChunks
};

HttpHeaderResponse.header = HttpHeaderResponse.setHeader;

export default HttpHeaderResponse;
