let Ajv;

try {
  Ajv = require('ajv');
} catch (e) {
  console.error(
    '[nanoexpress]: `Ajv` was not found in your dependencies list' +
      ', please install yourself for this feature working properly'
  );
}

export default class Config {
  get https() {
    return this._options.https !== undefined;
  }
  get swagger() {
    return this._options.swagger;
  }
  constructor(options = {}) {
    this._options = options;

    this.host = null;
    this.port = null;

    this.ajv = null;

    this.configureAjv = options.configureAjv;
    this.strictPath = options.strictPath;

    return this;
  }
  setAjv() {
    if (typeof Ajv !== 'function') {
      console.error('[nanoexpress]: `Ajv` was not initialized properly');
      return;
    }
    const { _options: options } = this;
    this.ajv = new Ajv(options.ajv);
    if (options.configureAjv) {
      this.ajv = options.configureAjv(this.ajv);
    }

    return this;
  }
}
