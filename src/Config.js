export default class Config {
  get https() {
    return this._options.https !== undefined && this._options.isSSL !== false;
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

    return this;
  }
}
