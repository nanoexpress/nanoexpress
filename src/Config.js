import Ajv from 'ajv';

export default class Config {
  get https() {
    return this._options.https !== undefined;
  }
  get swagger() {
    return this._options.swagger;
  }
  get console() {
    return this._options.console;
  }
  constructor(options = {}) {
    this._options = options;

    this.host = null;
    this.port = null;

    this.ajv = new Ajv(options.ajv);

    this.configureAjv = options.configureAjv;
    this.strictPath = options.strictPath;

    if (options.configureAjv) {
      this.ajv = options.configureAjv(this.ajv);
    }

    return this;
  }
}
