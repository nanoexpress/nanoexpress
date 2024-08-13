/* globals describe, it, expect */
import { HttpResponse } from '../../src/response-proto/index.js';

// Init Fake HttpResponse
class Response {
  constructor() {
    this.buffer = '';
    this.headers = {};
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

describe('http response getIP', () => {
  const fakeRes = new Response();

  it('res.send', () => {
    expect(fakeRes.getIP()).toBe('127.0.0.1');
  });
});

describe('http response send', () => {
  const fakeRes = new Response();

  it('res.send', () => {
    fakeRes.send('res.send works');
    expect(fakeRes.buffer).toBe('res.send works');
  });
  it('res.json', () => {
    fakeRes.json({ status: 'ok' });
    expect(fakeRes.buffer).toBe('{"status":"ok"}');
  });
  it('res.xml', () => {
    fakeRes.send('<xml />');
    expect(fakeRes.buffer).toBe('<xml />');
  });
  it('res.html', () => {
    fakeRes.send('<!DOCTYPE />');
    expect(fakeRes.buffer).toBe('<!DOCTYPE />');
  });
  it('res.plain', () => {
    fakeRes.send('Text works');
    expect(fakeRes.buffer).toBe('Text works');
  });
});

describe('http response header', () => {
  const fakeRes = new Response();

  it('res.setHeader', () => {
    fakeRes.setHeader('foo', 'bar');
    fakeRes.setHeader('bar', 'baz');
    expect(fakeRes._headers.foo).toBe('bar');
    expect(fakeRes._headers).toStrictEqual({ foo: 'bar', bar: 'baz' });
  });
  it('res.getHeader', () => {
    expect(fakeRes.getHeader('foo')).toBe('bar');
    expect(fakeRes.getHeader('bar')).toBe('baz');
  });
  it('res.hasHeader', () => {
    expect(fakeRes.hasHeader('foo')).toBe(true);
    expect(fakeRes.hasHeader('bar')).toBe(true);
  });
  it('res.removeHeader', () => {
    fakeRes.removeHeader('foo');
    expect(fakeRes._headers).toStrictEqual({ bar: 'baz' });
    expect(fakeRes.hasHeader('foo')).toBe(false);
  });
  it('res.removeHeader - last item delete', () => {
    fakeRes.removeHeader('bar');
    expect(fakeRes._headers).toStrictEqual({});
    expect(fakeRes.hasHeader('bar')).toBe(false);
  });
});

describe('http response status', () => {
  const fakeRes = new Response();

  it('res.status', () => {
    fakeRes.status(200);
    expect(fakeRes.statusCode).toBe('200 OK');
  });
});

describe('http response writeHead', () => {
  const fakeRes = new Response();

  it('res.status', () => {
    fakeRes.writeHead(201, { foo: 'bar' });
    expect(fakeRes.statusCode).toBe('201 Created');
    expect(fakeRes._headers).toStrictEqual({ foo: 'bar' });
  });
});

describe('http response redirect', () => {
  const fakeRes = new Response();
  fakeRes.__request = {
    headers: {
      host: 'localhost'
    }
  };

  it('res.status', () => {
    fakeRes.redirect('/another');
    expect(fakeRes.headers).toStrictEqual({
      Location: 'http://localhost/another'
    });
  });
});
