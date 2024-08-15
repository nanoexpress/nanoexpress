const HTTP_PREFIX = 'http://';
const HTTPS_PREFIX = 'https://';

export const normalizeLocation = (_path, config, host) => {
  let path = _path;

  if (path.indexOf('http') === -1) {
    if (path.indexOf('/') === -1) {
      path = `/${path}`;
    }
    let httpHost;
    if (host) {
      httpHost = host;
    } else if (config?.host) {
      httpHost = config.host;
      httpHost += config.port ? `:${config.port}` : '';
    }
    if (httpHost) {
      path = (config?.https ? HTTPS_PREFIX : HTTP_PREFIX) + httpHost + path;
    }
  }
  return path;
};

export default function redirect(_code, _path) {
  const { config } = this;
  const host = this.$headers?.host;
  let code = _code;
  let path = _path;

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

  return this;
}
