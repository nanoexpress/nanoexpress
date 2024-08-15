/* globals describe, it, expect, beforeAll, afterAll */
import nanoexpress from '../../src/nanoexpress.js';
import fetch from 'node-fetch';

describe('bind to specific host', () => {
  /** @type {import('../../nanoexpress.js').default.INanoexpressApp} */
  let app = null;

  beforeAll(() => {
    app = nanoexpress();
    app.any('/*', (_, res) => {
      // console.log("got request")
      res.end(Buffer.from(res.getRemoteAddress()).join('.'));
    });
    return app.listen(3000, '127.0.0.1');
  });

  afterAll(() => app.close());

  it('should return IPv4 address', async () => {
    const response = await fetch('http://127.0.0.1:3000');
    const ipaddr = await response.text();

    expect(ipaddr).toStrictEqual('127.0.0.1');
  });
});
