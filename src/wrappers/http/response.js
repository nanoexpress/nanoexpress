import http from 'http';
import { sendStream } from '../../helpers';
import jsonStringify from 'fast-json-stable-stringify';

export default (res, req, config, schema) => {
  // Crash handling
  res.onAborted(() => {
    res.aborted = true;
  });

  // Normalize status method
  res.status = (code) => {
    if (http.STATUS_CODES[code] !== undefined) {
      res.writeStatus(code + ' ' + http.STATUS_CODES[code]);
    } else {
      console.error('[Server]: Invalid Code ' + code);
    }
  };

  // Normalize setHeader method
  let headers;
  let headersCount = 0;
  res.setHeader = (key, value) => {
    if (!headers) {
      headers = {};
    }
    headersCount++;
    headers[key] = value;
  };

  // Normalize hasHeader method
  res.hasHeader = (key) => headers && headers[key] === undefined;

  // Normalize removeHeader
  res.removeHeader = (key) => {
    if (!headers) {
      return;
    }
    delete headers[key];
    headersCount--;

    if (headersCount === 0) {
      headers = null;
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
    if (!result || res.aborted) {
      console.error(
        '[Server]: Error, Response was aborted before responsing or result is marlformed'
      );
      return;
    }
    if (typeof result === 'string') {
      if (result.indexOf('<!DOCTYPE') === 0) {
        res.setHeader('Content-Type', 'text/html');
      } else if (result.indexOf('<xml') === 0) {
        res.setHeader('Content-Type', 'application/xml');
      }
    } else if (typeof result === 'object') {
      res.setHeader('Content-Type', 'application/json');
      if (schema) {
        result = schema(result);
      } else {
        result = jsonStringify(result);
      }
    }
    if (headersCount) {
      for (const header in headers) {
        res.writeHeader(header, headers[header]);
      }
    }
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
