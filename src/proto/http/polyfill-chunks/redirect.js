const HTTP_PREFIX = 'http://';
const HTTPS_PREFIX = 'https://';

export const normalizeLocation = (path, config, host) => {
  if (path.indexOf('http') === -1) {
    if (path.indexOf('/') === -1) {
      path = '/' + path;
    }
    let httpHost;
    if (host) {
      httpHost = host;
    } else if (config && config.host) {
      httpHost = config.host;
      httpHost += config.port ? `:${config.port}` : '';
    }
    if (httpHost) {
      path =
        (config && config.https ? HTTPS_PREFIX : HTTP_PREFIX) + httpHost + path;
    }
  }
  return path;
};

export default function redirect(code, path) {
  const { __request, config } = this;
  const host = __request && __request.headers && __request.headers.host;

  if (!path && typeof code === 'string') {
    path = code;
    code = 301;
  }

  let Location = '';
  if (path) {
    Location = normalizeLocation(path, config, host);
  }

  this.writeHead(code, { Location });
  this.end();
  this.aborted = true;

  return this;
}
