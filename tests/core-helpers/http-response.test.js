import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { HttpResponse } from '../../src/response-proto/index.js';

// Init Fake HttpResponse
class Response {
  constructor() {
    this.corks = [];
    this.buffer = '';
    this.headers = {};
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

  getRemoteAddressAsText() {
    const ipBuffer = new Uint8Array(4);

    ipBuffer[0] = 127;
    ipBuffer[3] = 1;

    return ipBuffer.join('.');
  }

  end(result) {
    this.buffer = result;
  }

  writeHeader(key, value) {
    this.headers[key] = value;
  }

  writeStatus(code) {
    this.code = code;
  }
}
Object.assign(Response.prototype, HttpResponse);

describe('http response send', () => {
  let fakeRes;

  beforeEach(() => {
    fakeRes = new Response();
  });

  it('res.send', () => {
    fakeRes.cork(() => {
      fakeRes.send('res.send works');
    });
    strictEqual(fakeRes.buffer, 'res.send works');
  });
  it('res.json', () => {
    fakeRes.cork(() => {
      fakeRes.json({ status: 'ok' });
    });

    strictEqual(fakeRes.buffer, '{"status":"ok"}');
  });
  it('res.xml', () => {
    fakeRes.cork(() => {
      fakeRes.send('<xml />');
    });
    strictEqual(fakeRes.buffer, '<xml />');
  });
  it('res.html', () => {
    fakeRes.cork(() => {
      fakeRes.send('<!DOCTYPE />');
    });
    strictEqual(fakeRes.buffer, '<!DOCTYPE />');
  });
  it('res.plain', () => {
    fakeRes.cork(() => {
      fakeRes.send('Text works');
    });
    strictEqual(fakeRes.buffer, 'Text works');
  });
});

describe('http response header', () => {
  const fakeRes = new Response();

  it('res.setHeader', () => {
    fakeRes.setHeader('foo', 'bar');
    fakeRes.setHeader('bar', 'baz');
    strictEqual(fakeRes._headers.foo, 'bar');
    deepStrictEqual(fakeRes._headers, { foo: 'bar', bar: 'baz' });
  });
  it('res.getHeader', () => {
    strictEqual(fakeRes.getHeader('foo'), 'bar');
    strictEqual(fakeRes.getHeader('bar'), 'baz');
  });
  it('res.hasHeader', () => {
    strictEqual(fakeRes.hasHeader('foo'), true);
    strictEqual(fakeRes.hasHeader('bar'), true);
  });
  it('res.removeHeader', () => {
    fakeRes.removeHeader('foo');
    deepStrictEqual(fakeRes._headers, { bar: 'baz' });
    strictEqual(fakeRes.hasHeader('foo'), false);
  });
  it('res.removeHeader - last item delete', () => {
    fakeRes.removeHeader('bar');
    deepStrictEqual(fakeRes._headers, {});
    strictEqual(fakeRes.hasHeader('bar'), false);
  });
});

describe('http response status', () => {
  const fakeRes = new Response();

  it('res.status', () => {
    fakeRes.cork(() => {
      fakeRes.status(200);
    });
    strictEqual(fakeRes.statusCode, '200 OK');
  });
});

describe('http response writeHead', () => {
  const fakeRes = new Response();

  it('res.status', () => {
    fakeRes.cork(() => {
      fakeRes.writeHead(201, { foo: 'bar' });
    });
    strictEqual(fakeRes.statusCode, '201 Created');
    deepStrictEqual(fakeRes._headers, { foo: 'bar' });
  });
});

describe('http response redirect', () => {
  const fakeRes = new Response();
  fakeRes.$headers = {
    host: 'localhost'
  };

  it('res.status', () => {
    fakeRes.cork(() => {
      fakeRes.redirect('/another');
    });

    deepStrictEqual(fakeRes.headers, {
      Location: '/another'
    });
  });
});
