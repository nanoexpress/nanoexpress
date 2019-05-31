const HttpHeaderResponse = {
  // Normalize setHeader method
  setHeader(key, value) {
    this.modifyEnd();

    if (!this._headers) {
      this._headers = {};
      this._headersCount = 0;
    }
    this._headersCount++;
    this._headers[key] = value;
    return this;
  },

  // Normalize getHeader method
  getHeader(key) {
    return !!this._headers && !!key && this._headers[key];
  },

  // Normalize hasHeader method
  hasHeader(key) {
    return (
      !!this._headers &&
      this._headers[key] !== undefined &&
      this._headers[key] !== null
    );
  },

  // Normalize removeHeader
  removeHeader(key) {
    if (!this._headers || !this._headers[key]) {
      return undefined;
    }
    this.modifyEnd();
    this._headers[key] = null;
    this._headersCount--;

    return this;
  },

  // For rare some cases
  writeHeaderValues(header, values) {
    for (let i = 0, len = values.length; i < len; i++) {
      this.writeHeader(header, values[i]);
    }
  },
  applyHeaders() {
    const { _headers, _headersCount } = this;
    if (_headersCount > 0) {
      for (const header in _headers) {
        const value = _headers[header];

        if (value !== undefined && value !== null) {
          if (value.splice && value.length) {
            this.writeHeaderValues(header, value);
          } else {
            this.writeHeader(header, value);
          }
          this.removeHeader(header);
        }
      }
    }

    return this;
  },
  setHeaders(headers) {
    for (const header in headers) {
      if (this._headers) {
        const currentHeader = this._headers[header];
        if (currentHeader !== undefined || currentHeader !== null) {
          continue;
        }
      }
      this.setHeader(header, headers[header]);
    }

    return this;
  },
  writeHeaders(headers) {
    for (const header in headers) {
      const value = headers[header];
      if (value !== undefined && value !== null) {
        if (value.splice && value.length) {
          this.writeHeaderValues(header, value);
        } else {
          this.writeHeader(header, value);
        }
      }
    }
    return this;
  }
};

export default HttpHeaderResponse;
