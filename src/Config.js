import Ajv from 'ajv';

export default class Config {
  get https() {
    return this._options.https !== undefined && this._options.isSSL !== false;
  }

  get swagger() {
    return this._options.swagger;
  }

  get console() {
    if (this._options.console === false) {
      return {
        log: () => {
          // empty by default?
        },
        error: () => {
          // empty by default?
        },
        warn: () => {
          // empty by default?
        },
        debug: () => {
          // empty by default?
        },
        info: () => {
          // empty by default?
        }
      };
    }

    return this._options.console || console;
  }

  constructor(options = {}) {
    this._options = options;

    this.host = null;
    this.port = null;

    this.ajv = Ajv.default
      ? // eslint-disable-next-line new-cap
        new Ajv.default(options.ajv)
      : new Ajv(options.ajv);

    this.configureAjv = options.configureAjv;

    if (options.configureAjv) {
      this.ajv = options.configureAjv(this.ajv);
    }

    return this;
  }
}
