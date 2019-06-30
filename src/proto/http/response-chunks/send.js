export default function send(result) {
  /* If we were aborted, you cannot respond */
  if (this.aborted) {
    console.error('[Server]: Error, Response was aborted before responsing');
    return undefined;
  }
  if (this.writeHead) {
    this.writeHead(this.statusCode || 200, this._headers);
  }
  if ((this.statusCode || this._headers) && !this._modifiedEnd) {
    this.modifyEnd();
  }

  if (typeof result === 'object') {
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
  }

  this.end(result);

  return this;
}
