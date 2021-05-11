/* globals describe, it, expect */
import { Readable } from 'stream';
import { prepareParams } from '../../src/helpers/index.js';
import {
  body,
  cookies,
  headers,
  params,
  queries
} from '../../src/request-proto/index.js';

describe('headers normalize', () => {
  it('header normalize non-empty', () => {
    const fakeReq = {
      forEach(fn) {
        for (let i = 1; i < 4; i += 1) {
          fn(`header_${i}`, `header_value${i}`);
        }
      }
    };

    expect(headers(fakeReq)).toStrictEqual({
      header_1: 'header_value1',
      header_2: 'header_value2',
      header_3: 'header_value3'
    });
  });
  it('header normalize empty', () => {
    const fakeReq = {
      forEach() {}
    };

    expect(headers(fakeReq)).toStrictEqual(undefined);
  });
});

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

    expect(params(fakeReq, preparedParams)).toStrictEqual({
      p1: 'paramValue1',
      p2: 'paramValue2'
    });
  });
  it('params normalize empty', () => {
    const fakeReq = {
      rawPath: '/',
      forEach() {},
      getParameter() {}
    };

    expect(params(fakeReq)).toBe(undefined);
  });
});

describe('queries normalize', () => {
  it('queries normalize non-empty', () => {
    const fakeReq = {
      getQuery() {
        return 'foo=bar&bar=baz';
      }
    };

    expect(queries(fakeReq)).toStrictEqual({
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

    expect(queries(fakeReq)).toBe(undefined);
  });
});

describe('body normalize', () => {
  it('body normalize non-empty', async () => {
    const stream = new Readable({
      read() {}
    });
    const fakeReq = {
      stream
    };
    const fakeRes = {
      onAborted() {}
    };

    stream.push(Buffer.from('fake body'));
    setTimeout(() => stream.push(null), 50);

    await body(fakeReq, fakeRes);
    expect(fakeReq.body).toStrictEqual(Buffer.from('fake body'));
  });
  it('body normalize empty', async () => {
    const fakeReq = {};

    expect(await body(fakeReq)).toBe(undefined);
  });
});

describe('cookie normalize', () => {
  it('cookie normalize non-empty', async () => {
    const fakeReq = {
      headers: {
        cookie: 'foo=bar'
      }
    };

    expect(cookies(fakeReq)).toStrictEqual({ foo: 'bar' });
  });
  it('cookie normalize empty', async () => {
    const fakeReq = {};
    fakeReq.getHeader = () => '';

    expect(cookies(fakeReq)).toBe(undefined);
  });
});
