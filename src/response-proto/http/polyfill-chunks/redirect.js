const HTTP_PREFIX = 'http://';
const HTTPS_PREFIX = 'https://';

export const normalizeLocation = (_path, config, host) => {
  let path = _path;

  if (path === undefined) {
    throw new Error('Input validation error');
  }
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
  let code = _code;
  let path = _path;

  if (!path && typeof code === 'string') {
    path = code;
    code = 301;
  }

  let Location = '';
  if (path) {
    // never build absolute URLs from the request Host header (Host-header
    // injection); only the trusted `config.host` may produce an absolute URL
    Location = normalizeLocation(path, config);
  }

  this.writeHead(code, { Location });
  this.end();

  return this;
}
