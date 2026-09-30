import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { Readable } from 'node:stream';
import { describe, it } from 'node:test';
import fastQueryParse from 'fast-query-parse';
import { prepareParams } from '../../src/helpers/index.js';
import { body, params } from '../../src/request-proto/index.js';

describe('params normalize', () => {
  it('params normalize non-empty', () => {
    const paramsValues = ['paramValue1', 'paramValue2'];

    const fakeReq = {
      rawPath: '/:p1/:p2',
      getParameter(index) {
        return paramsValues[index];
      }
    };

    const preparedParams = prepareParams(fakeReq.rawPath);

    deepStrictEqual(params(fakeReq, preparedParams), {
      p1: 'paramValue1',
      p2: 'paramValue2'
    });
  });
  it('params normalize empty', () => {
    const fakeReq = {
      rawPath: '/',
      forEach() {
        // mock method
      },
      getParameter() {
        // mock method
      }
    };

    strictEqual(params(fakeReq), undefined);
  });
});

describe('queries normalize', () => {
  it('queries normalize non-empty', () => {
    const fakeReq = {
      getQuery() {
        return 'foo=bar&bar=baz';
      }
    };

    deepStrictEqual(fastQueryParse(fakeReq.getQuery()), {
      foo: 'bar',
      bar: 'baz'
    });
  });
  it('queries normalize empty', () => {
    const fakeReq = {
      getQuery() {
        return '';
      }
    };

    strictEqual(fastQueryParse(fakeReq.getQuery()), null);
  });
});

describe('body normalize', () => {
  it('body normalize non-empty', async () => {
    const stream = new Readable({
      read() {
        // mock read
      }
    });

    const bodyInput = 'fake body';
    const fakeReq = {
      stream,
      headers: {
        'content-type': 'application/json',
        'content-length': bodyInput.length
      }
    };
    const fakeRes = {
      onAborted() {
        // mock handler
      }
    };

    stream.push(new TextEncoder().encode(bodyInput));
    setTimeout(() => stream.push(null), 50);

    await body(fakeReq, fakeRes);
    deepStrictEqual(fakeReq.body, Buffer.from(bodyInput));
  });
  it('body normalize empty', async () => {
    const fakeReq = {};

    strictEqual(await body(fakeReq), undefined);
  });
});

describe('cookie normalize', () => {
  it('cookie normalize non-empty', async () => {
    const fakeReq = {
      headers: {
        cookie: 'foo=bar'
      }
    };

    deepStrictEqual(fastQueryParse(fakeReq.headers.cookie), {
      foo: 'bar'
    });
  });
  it('cookie normalize empty', async () => {
    const fakeReq = {};
    fakeReq.getHeader = () => '';

    strictEqual(fastQueryParse(fakeReq.getHeader('cookie')), null);
  });
});
