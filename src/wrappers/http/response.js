import { httpCodes } from '../../constants';
import { sendStream } from '../../helpers';

export default (res) => {
  // Crash handling
  res.onAborted(() => {
    res.aborted = true;
  });

  // Normalize status method
  res.status = (code) => {
    if (httpCodes[code] !== undefined) {
      res.writeStatus(code + ' ' + httpCodes[code]);
    } else {
      console.error('[Server]: Invalid Code ' + code);
    }
  };

  // Normalize setHeader method
  res.setHeader = (key, value) => {
    res.writeHeader(key, value);
  };

  // Add stream feature by just method
  // for easy and clean code
  res.stream = sendStream(res);

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
