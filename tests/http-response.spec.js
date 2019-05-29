/* globals describe, it, expect */
import { HttpResponse } from '../src/proto';

// Init Fake HttpResponse
class Response {
  constructor() {
    this.buffer = '';
    this.headers = {};
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
    fakeRes.xml('<xml />');
    expect(fakeRes.buffer).toBe('<xml />');
  });
  it('res.html', () => {
    fakeRes.xml('<!DOCTYPE />');
    expect(fakeRes.buffer).toBe('<!DOCTYPE />');
  });
  it('res.plain', () => {
    fakeRes.xml('Text works');
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
    expect(fakeRes._headers).toBe(undefined);
    expect(fakeRes.hasHeader('bar')).toBe(false);
  });
});

describe('http response status', () => {
  const fakeRes = new Response();

  it('res.status', () => {
    fakeRes.status(200);
    expect(fakeRes.code).toBe('200 OK');
  });
});
