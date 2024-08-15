import HttpResponseExtends from '../../src/response-proto/http/HttpResponse.js';

class HttpResponse {
  constructor() {
    this.corks = [];
    this.___headers = [];
    this.___code = '200 OK';
    this.___end = null;
  }

  runCorks() {
    const { corks } = this;

    for (const cork of corks) {
      cork();
    }

    return this;
  }

  cork(callback) {
    callback();
    return this.runCorks();
  }

  writeHeader(key, value) {
    this.___headers.push({ key, value });
  }

  writeStatus(code) {
    if (typeof code !== 'string') {
      throw new Error('HttpResponse.writeStatus accepts only String');
    }

    this.___code = code;
  }

  end(end) {
    if (this.___end) {
      throw new Error('Invalid access of used HttpResponse');
    }
    if (end === undefined) {
      this.___end = '';
    } else if (
      typeof end !== 'string' &&
      !Array.isArray(end) &&
      !end.toString
    ) {
      throw new Error(
        'HttpResponse accepts only String, Array, TypedArray or Buffer'
      );
    }

    this.___end = end;
  }
}
Object.assign(HttpResponse.prototype, HttpResponseExtends);

export default HttpResponse;
