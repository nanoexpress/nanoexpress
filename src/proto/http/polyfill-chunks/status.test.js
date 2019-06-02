/* global describe, expect, it */
import { default as status } from './status';

describe('normalize status', () => {
  const _this = {};

  it('empty values should throw', () => {
    expect.assertions(1);
    try {
      status.call(_this);
    } catch (e) {
      expect(e.message).toBe('Invalid Code: undefined');
    }
  });
  it('status string should not changed', () => {
    status.call(_this, '201 Created');

    expect(_this.statusCode).toBe('201 Created');
  });
  it('status http code should be normalised', () => {
    status.call(_this, 201);

    expect(_this.statusCode).toBe('201 Created');
  });
  it('status invalid code-type should be thrown', () => {
    expect.assertions(1);
    try {
      status.call(_this, { code: 200 });
    } catch (e) {
      expect(e.message).toBe('Invalid Code: {"code":200}');
    }
  });
  it('status should trigger #modifyEnd method', async (done) => {
    _this.modifyEnd = () => {
      done();
    };

    status.call(_this, 200);
  });
});
