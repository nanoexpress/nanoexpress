export default function send(result) {
  if (this._headers && this.writeHead && !this._headWritten) {
    this.writeHead(this.statusCode || 200, this._headers);
    this._headWritten = true;
  }
  if ((this.statusCode || this._headers) && !this._modifiedEnd) {
    this.modifyEnd();
  }

  if (!result) {
    result = '';
  } else if (typeof result === 'object') {
    this.writeHeader('Content-Type', 'application/json');

    const { fastJson } = this;

    if (fastJson) {
      const fastJsonWithCode = fastJson[this.rawStatusCode];

      if (fastJsonWithCode) {
        result = fastJsonWithCode(result);
      } else {
        result = fastJson(result);
      }
    } else {
      result = JSON.stringify(result);
    }
  }

  return this.end(result);
}
