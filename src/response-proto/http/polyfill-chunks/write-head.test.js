/* global describe, expect, it */
import HttpResponse from '../../../../tests/mock/HttpResponse.js';
import writeHead from './write-head.js';

describe('writeHead status', () => {
  it('empty status should do nothing', async () => {
    const res = new HttpResponse();
    writeHead.call(res);
  });
  it('string status code should work', () => {
    const res = new HttpResponse();
    writeHead.call(res, '201 Created');

    expect(res.statusCode).toBe('201 Created');
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

    expect(res.statusCode).toBe('201 Created');
    expect(res._headers).toStrictEqual({
      Location: '/path'
    });
  });
});
