import http from 'http';

export default function status(code, notModify) {
  if (!notModify && this.modifyEnd && !this._modifiedEnd) {
    this.modifyEnd();
  }

  if (typeof code === 'string') {
    this.statusCode = code;
    this.rawStatusCode = parseInt(code);
  } else if (http.STATUS_CODES[code] !== undefined) {
    this.statusCode = code + ' ' + http.STATUS_CODES[code];
    this.rawStatusCode = code;
  } else {
    throw new Error('Invalid Code: ' + JSON.stringify(code));
  }

  return this;
}
