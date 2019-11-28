export default function send(result) {
  if (!result) {
    result = '';
  } else if (typeof result === 'object') {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');

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
