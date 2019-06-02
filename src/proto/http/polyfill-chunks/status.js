import http from 'http';

export default function status(code) {
  if (this.modifyEnd) {
    this.modifyEnd();
  }

  if (typeof code === 'string') {
    this.statusCode = code;
  } else if (http.STATUS_CODES[code] !== undefined) {
    this.statusCode = code + ' ' + http.STATUS_CODES[code];
  } else {
    throw new Error('Invalid Code: ' + JSON.stringify(code));
  }

  return this;
}
