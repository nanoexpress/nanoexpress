import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import status from './status.js';

describe('normalize status', () => {
  const _this = {};

  it('empty values should throw', () => {
    try {
      status.call(_this);
    } catch (e) {
      strictEqual(e.message, 'Invalid Code: undefined');
    }
  });
  it('status string should not changed', () => {
    status.call(_this, '201 Created');

    strictEqual(_this.statusCode, '201 Created');
  });
  it('status http code should be normalised', () => {
    status.call(_this, 201);

    strictEqual(_this.statusCode, '201 Created');
  });
  it('status invalid code-type should be thrown', () => {
    try {
      status.call(_this, { code: 200 });
    } catch (e) {
      strictEqual(e.message, 'Invalid Code: {"code":200}');
    }
  });
});
