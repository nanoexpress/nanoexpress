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
    if (typeof result === 'object' && result) {
      res.setHeader('Content-Type', 'application/json');
      result = JSON.stringify(result);
    } else if (typeof result === 'string') {
      if (result.startsWith('<xml')) {
        res.setHeader('Content-Type', 'application/xml');
      } else if (result.startsWith('<!DOCTYPE')) {
        res.setHeader('Content-Type', 'text/html');
      } else {
        res.setHeader('Content-Type', 'text/plain');
      }
    }
    return res.end(result);
  };

  // It boosts performance by large-margin
  // if you use it right :)
  res.cork = (result) => {
    res.experimental_cork(() => {
      res.send(result);
    });
  };

  // Aliases for beginners and/or users from Express!
  res.json = res.send;
  res.html = res.send;
  res.xml = res.send;

  return res;
};
