import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import HttpResponse from '../mock/HttpResponse.js';
import writeHead from '../../src/response-proto/http/polyfill-chunks/write-head.js';

describe('writeHead status', () => {
  it('empty status should do nothing', async () => {
    const res = new HttpResponse();
    writeHead.call(res);
  });
  it('string status code should work', () => {
    const res = new HttpResponse();
    writeHead.call(res, '201 Created');

    strictEqual(res.statusCode, '201 Created');
  });
});

describe('writeHead headers', () => {
  it('empty status should do nothing', async () => {
    const res = new HttpResponse();
    writeHead.call(res, 201);
  });
  it('http headers should work', () => {
    const res = new HttpResponse();
    writeHead.call(res, 201, { Location: '/path' });

    strictEqual(res.statusCode, '201 Created');
    deepStrictEqual(res._headers, {
      Location: '/path'
    });
  });
});
