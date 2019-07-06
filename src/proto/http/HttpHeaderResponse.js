import * as HttpHeaderResponseChunks from './header-chunks';

const HttpHeaderResponse = {
  ...HttpHeaderResponseChunks
};

HttpHeaderResponse.header = HttpHeaderResponse.setHeader;

export default HttpHeaderResponse;
