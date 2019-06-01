import http from 'http';

export default function status(code) {
  this.modifyEnd();
  if (typeof this.statusCode === 'string') {
    return this;
  }
  if (typeof code === 'string') {
    this.statusCode = code;
  } else if (http.STATUS_CODES[code] !== undefined) {
    this.statusCode = code + ' ' + http.STATUS_CODES[code];
  } else {
    console.error('[Server]: Invalid Code', code);
  }

  return this;
}
