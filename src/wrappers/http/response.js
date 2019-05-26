import http from 'http';
import { sendStream } from '../../helpers';

export default (res, req) => {
  // Crash handling
  res.onAborted(() => {
    res.aborted = true;
  });

  // Normalize status method
  res.status = (code) => {
    if (http.STATUS_CODES[code] !== undefined) {
      res.___status = code + ' ' + http.STATUS_CODES[code];
    } else {
      console.error('[Server]: Invalid Code ' + code);
    }
  };

  // Normalize setHeader method
  res.setHeader = (key, value) => {
    if (!res.___headers) {
      res.___headers = {};
    }
    res.___headers[key] = value;
  };

  // Normalize hasHeader method
  res.hasHeader = (key) => res.___headers && res.___headers[key] === undefined;

  // Normalize removeHeader
  res.removeHeader = (key) => {
    if (!res.___headers) {
      return;
    }
    delete res.___headers[key];

    if (Object.keys(res.___headers).length === 0) {
      delete res.___headers;
    }
  };

  // Add stream feature by just method
  // for easy and clean code
  res.stream = sendStream(req, res);

  // Normalise send method
  // And some features, like
  // HTML, JSON, XML and Plain
  // parsing out-of-the-box
  res.send = (result) => {
    /* If we were aborted, you cannot respond */
    if (res.aborted) {
      console.error('[Server]: Error, Response was aborted before responsing');
      return;
    }
    if (res.___status) {
      res.writeStatus(res.___status);
    }
    if (res.___headers) {
      for (const header in res.___headers) {
        res.writeHeader(header, res.___headers[header]);
      }
    }
    return res.end(result);
  };

  // It boosts performance by large-margin
  // if you use it right :)
  res.cork = (result, method = 'send') => {
    if (res.experimental_cork) {
      res.experimental_cork(() => {
        res[method](result);
      });
    } else {
      return res[method](result);
    }
  };

  // Aliases for beginners and/or users from Express!
  res.json = (result, schema) => {
    if (typeof result === 'object' && result) {
      res.setHeader('Content-Type', 'application/json');
      if (schema && typeof schema === 'function') {
        result = schema(result);
      } else {
        result = JSON.stringify(result);
      }
    }
    return res.send(result);
  };
  res.plain = (result) => {
    if (typeof result === 'string') {
      res.setHeader('Content-Type', 'text/plain');
    }
    return res.send(result);
  };
  res.html = (result) => {
    if (typeof result === 'string' && result.startsWith('<!DOCTYPE')) {
      res.setHeader('Content-Type', 'text/html');
    }
    return res.send(result);
  };
  res.xml = (result) => {
    if (typeof result === 'string' && result.startsWith('<xml')) {
      res.setHeader('Content-Type', 'application/xml');
    }
    return res.send(result);
  };

  return res;
};
