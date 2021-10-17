/* global describe, expect, it */
import HttpResponse from '../../../../tests/mock/HttpResponse.js';
import redirect, { normalizeLocation } from './redirect.js';

describe('normalize location', () => {
  it('empty values should throw', () => {
    expect.assertions(1);
    try {
      normalizeLocation();
    } catch (e) {
      expect(e.message).toBe(
        "Cannot read properties of undefined (reading 'indexOf')"
      );
    }
  });
  it('only one argument should return the argument itself', () => {
    expect(normalizeLocation('/path')).toBe('/path');
  });
  it('config:host argument should be parsed correctly', () => {
    expect(normalizeLocation('/path', { host: 'localhost' })).toBe(
      'http://localhost/path'
    );
  });
  it('config:https argument should be parsed correctly', () => {
    expect(normalizeLocation('/path', { https: true, host: 'localhost' })).toBe(
      'https://localhost/path'
    );
  });
  it('config:host and config:port argument should be parsed correctly', () => {
    expect(normalizeLocation('/path', { host: 'localhost', port: 3200 })).toBe(
      'http://localhost:3200/path'
    );
  });
  it('third host argument should be parsed correctly', () => {
    expect(normalizeLocation('/path', null, 'myhost')).toBe(
      'http://myhost/path'
    );
  });
  it('third host argument should be in priority than second config argument', () => {
    expect(
      normalizeLocation('/path', { host: 'localhost', port: 3200 }, 'myhost')
    ).toBe('http://myhost/path');
  });
});

describe('redirect polyfill method', () => {
  it('should return correct code', () => {
    const res = new HttpResponse();

    redirect.call(res, 301);

    expect(res.___code).toBe('301 Moved Permanently');
  });
  it('should return correct path and autocorrected code', () => {
    const res = new HttpResponse();

    redirect.call(res, '/path');

    expect(res.___code).toBe('301 Moved Permanently');
    expect(res.___headers).toStrictEqual([{ key: 'Location', value: '/path' }]);
  });
  it('should return correct path with host', () => {
    const res = new HttpResponse();
    res.__request = {
      headers: {
        host: 'localhost:3333'
      }
    };

    redirect.call(res, '/path');

    expect(res.___code).toBe('301 Moved Permanently');
    expect(res.___headers).toStrictEqual([
      { key: 'Location', value: 'http://localhost:3333/path' }
    ]);
  });
});
