const HTTP_PREFIX = 'http://';
const HTTPS_PREFIX = 'https://';

const normalizeLocation = (path, config, host) => {
  if (path.indexOf('http') === -1) {
    if (path.indexOf('/') === -1) {
      path = '/' + path;
    }
    const httpHost = (config && config.host) || host;
    path =
      config && config.https ? HTTPS_PREFIX : HTTP_PREFIX + httpHost + path;
  }
  return path;
};

export default function redirect(code, path) {
  const { __request, config } = this;
  const host = __request && __request.headers && __request.headers.host;

  if (!path) {
    path = code;
    code = 301;
  }

  path = normalizeLocation(path, config, host);

  this.writeHead(code, { Location: path });
  this.end();
  this.aborted = true;

  return this;
}
