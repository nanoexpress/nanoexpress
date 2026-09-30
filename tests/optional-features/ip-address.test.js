import { strictEqual } from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import nanoexpress from '../../src/nanoexpress.js';

describe('bind to specific host', () => {
  /** @type {import('../../nanoexpress.js').default.INanoexpressApp} */
  let app = null;

  before(() => {
    app = nanoexpress();
    app.any('/*', (_, res) => {
      res.end(Buffer.from(res.getRemoteAddress()).join('.'));
    });
    return app.listen(3000, '127.0.0.1');
  });

  after(() => app.close());

  it('should return IPv4 address', async () => {
    const response = await fetch('http://127.0.0.1:3000');
    const ipaddr = await response.text();

    strictEqual(ipaddr, '127.0.0.1');
  });
});
