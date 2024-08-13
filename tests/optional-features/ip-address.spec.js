/* globals describe, it, expect, beforeAll, afterAll */
import http from 'node:http';
import nanoexpress from '../../src/nanoexpress.js';

describe('bind to specific host', () => {
  let app = null;

  beforeAll(() => {
    app = nanoexpress().any('/*', (_, res) => {
      // console.log("got request")
      res.end(Buffer.from(res.getRemoteAddress()).join('.'));
    });
    return app.listen(3000, '127.0.0.1');
  });

  afterAll(() => app.close());

  it('should return IPv4 address', () =>
    new Promise((resolve, reject) => {
      http
        .request({ host: '127.0.0.1', port: 3000 }, (res) => {
          // console.log("Response received");
          res.on('data', (d) => resolve(d));
          res.on('error', (e) => reject(e));
        })
        .end();
    }).then((resp) =>
      expect(resp.toString('ascii')).toStrictEqual('127.0.0.1')
    ));
});
