export default function send(result) {
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
