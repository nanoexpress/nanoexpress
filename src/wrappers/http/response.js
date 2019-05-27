import http from 'http';
import flatstr from 'flatstr';
import { sendStream } from '../../helpers';

export default (res, req, config, schema) => {
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
    if (typeof result === 'object' && result) {
      res.setHeader('Content-Type', 'application/json');
      if (schema) {
        result = schema(result);
      } else {
        result = JSON.stringify(result);
      }
    } else if (typeof result === 'string') {
      if (result.indexOf('<!DOCTYPE') === 0) {
        res.setHeader('Content-Type', 'text/html');
      } else if (result.indexOf('<xml') === 0) {
        res.setHeader('Content-Type', 'application/xml');
      }
    }
    flatstr(result);
    return res.end(result);
  };

  // It boosts performance by large-margin
  // if you use it right :)
  res.cork = res.experimental_cork
    ? (result) =>
      res.experimental_cork(() => {
        res.send(result);
      })
    : res.send;

  // Aliases for beginners and/or users from Express!
  res.json = res.send;
  res.plain = res.send;
  res.html = res.send;
  res.xml = res.send;

  return res;
};
