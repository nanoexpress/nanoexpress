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
  return res;
};
