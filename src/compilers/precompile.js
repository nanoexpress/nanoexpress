import responseMethods from '../response-proto/http/HttpResponse.js';
import uWS from 'uWebSockets.js';

class HttpResponseAOT extends uWS.DeclarativeResponse {
  cork(callback) {
    return callback();
  }

  onAborted() {
    // noop
  }

  end(value) {
    this._buffer = super.end(value);
  }
}

const nonSimpleProps = [
  'query',
  'cookies',
  'body',
  'pipe',
  'stream',
  'getIP'
].map((prop) => `req.${prop}`);

const nonSimpleMethods = Object.keys(responseMethods).map(
  (method) => `res.${method}`
);

export default async function precompileRoute(callback, params) {
  const content = callback.toString();

  // Dirty fastest check for Simple function
  for (const prop of nonSimpleProps) {
    if (content.includes(prop)) {
      return null;
    }
  }

  // Dirty fastest check for Simple function
  for (const method of nonSimpleMethods) {
    if (content.includes(method)) {
      return null;
    }
  }

  const response = new HttpResponseAOT();
  if (callback.isCompiled) {
    await callback(response, params);
  } else {
    await callback(params, response);
  }

  return response._buffer;
}
