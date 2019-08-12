export default function send(result) {
  /* If we were aborted, you cannot respond */
  if (this.aborted) {
    console.error('[Server]: Error, Response was aborted before responsing');
    return undefined;
  }
  if (this._headers && this.writeHead && !this._headWritten && !this.aborted) {
    this.writeHead(this.statusCode || 200, this._headers);
    this._headWritten = true;
  }
  if ((this.statusCode || this._headers) && !this._modifiedEnd) {
    this.modifyEnd();
  }

  if (result === null || result === undefined) {
    this.end('');
  } else if (typeof result === 'object') {
    this.writeHeader('Content-Type', 'application/json');

    if (this.schema) {
      const { schema } = this;

      const schemaWithCode = schema[this.rawStatusCode];

      if (schemaWithCode) {
        result = schemaWithCode(result);
      } else {
        result = schema(result);
      }
    } else {
      result = JSON.stringify(result);
    }

    this.end(result);
  } else {
    this.end(result);
  }

  return this;
}
