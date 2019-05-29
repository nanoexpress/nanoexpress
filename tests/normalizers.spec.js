/* globals describe, it, expect */
import { headers, cookies, params, queries, body } from '../src/normalizers';

describe('headers normalize', () => {
  it('header normalize non-empty', () => {
    const fakeReq = {
      forEach(fn) {
        for (let i = 1; i < 4; i++) {
          fn('header_' + i, 'header_value' + i);
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

    expect(headers(fakeReq)).toStrictEqual({});
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

    expect(params(fakeReq)).toStrictEqual({
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

    expect(params(fakeReq)).toStrictEqual({});
  });
});

describe('queries normalize', () => {
  it('queries normalize non-empty', () => {
    const fakeReq = {
      getQuery() {
        return '?foo=bar&bar=baz';
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
        return '?';
      }
    };

    expect(queries(fakeReq)).toStrictEqual({});
  });
});

describe('body normalize', () => {
  it('body normalize non-empty', async () => {
    const fakeReq = {};
    const fakeRes = {
      onData(fn) {
        fn(Buffer.from('fake body'), true);
      }
    };

    expect(await body(fakeReq, fakeRes)).toBe('fake body');
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

    expect(cookies(fakeReq)).toStrictEqual({});
  });
});
