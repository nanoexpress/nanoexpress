import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import HttpResponse from '../mock/HttpResponse.js';
import redirect, {
  normalizeLocation
} from '../../src/response-proto/http/polyfill-chunks/redirect.js';

describe('normalize location', () => {
  it('empty values should throw', () => {
    try {
      normalizeLocation();
    } catch (e) {
      strictEqual(e.message, 'Input validation error');
    }
  });
  it('only one argument should return the argument itself', () => {
    strictEqual(normalizeLocation('/path'), '/path');
  });
  it('config:host argument should be parsed correctly', () => {
    strictEqual(
      normalizeLocation('/path', { host: 'localhost' }),
      'http://localhost/path'
    );
  });
  it('config:https argument should be parsed correctly', () => {
    strictEqual(
      normalizeLocation('/path', { https: true, host: 'localhost' }),
      'https://localhost/path'
    );
  });
  it('config:host and config:port argument should be parsed correctly', () => {
    strictEqual(
      normalizeLocation('/path', { host: 'localhost', port: 3200 }),
      'http://localhost:3200/path'
    );
  });
  it('third host argument should be parsed correctly', () => {
    strictEqual(
      normalizeLocation('/path', null, 'myhost'),
      'http://myhost/path'
    );
  });
  it('third host argument should be in priority than second config argument', () => {
    strictEqual(
      normalizeLocation('/path', { host: 'localhost', port: 3200 }, 'myhost'),
      'http://myhost/path'
    );
  });
});

describe('redirect polyfill method', () => {
  it('should return correct code', () => {
    const res = new HttpResponse();

    res.cork(() => {
      redirect.call(res, 301);
    });

    strictEqual(res.___code, '301 Moved Permanently');
  });
  it('should return correct path and autocorrected code', () => {
    const res = new HttpResponse();

    res.cork(() => {
      redirect.call(res, '/path');
    });

    strictEqual(res.___code, '301 Moved Permanently');
    deepStrictEqual(res.___headers, [{ key: 'Location', value: '/path' }]);
  });
  it('should ignore the request Host header (untrusted)', () => {
    const res = new HttpResponse();
    res.$headers = {
      host: 'evil.example'
    };

    res.cork(() => {
      redirect.call(res, '/path');
    });

    strictEqual(res.___code, '301 Moved Permanently');
    deepStrictEqual(res.___headers, [{ key: 'Location', value: '/path' }]);
  });
  it('should build absolute Location from trusted config.host only', () => {
    const res = new HttpResponse();
    res.config = { host: 'trusted.example' };

    res.cork(() => {
      redirect.call(res, '/path');
    });

    strictEqual(res.___code, '301 Moved Permanently');
    deepStrictEqual(res.___headers, [
      { key: 'Location', value: 'http://trusted.example/path' }
    ]);
  });
});
