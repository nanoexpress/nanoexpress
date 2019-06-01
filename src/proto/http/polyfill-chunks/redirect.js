export default function redirect(code, path) {
  const { __request, config } = this;
  const host = __request && __request.headers && __request.headers.host;

  const httpHost = (config && config.host) || host;

  if (!path) {
    path = code;
    code = 301;
  }

  if (!path.startsWith('http')) {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    path = config && config.https ? 'https://' : 'http://' + httpHost + path;
  }

  this.writeHead(code, { Location: path });
  this.end();
  this.aborted = true;

  return this;
}
