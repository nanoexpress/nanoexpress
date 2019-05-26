import { httpCodes } from '../../constants';

export default (res) => {
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

  // Normalise send method
  // And some features, like
  // HTML, JSON, XML and Plain
  // parsing out-of-the-box
  res.send = (result) => {
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
