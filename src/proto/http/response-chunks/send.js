export default function send(result) {
  /* If we were aborted, you cannot respond */
  if (this.aborted) {
    console.error('[Server]: Error, Response was aborted before responsing');
    return undefined;
  }
  if (this.statusCode) {
    this.modifyEnd();
  }
  if (typeof result === 'object') {
    this.setHeader('Content-Type', 'application/json');
    result = this.schema ? this.schema(result) : JSON.stringify(result);
  }

  this.end(result);

  return this;
}
