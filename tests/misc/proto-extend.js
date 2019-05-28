const assert = require('assert');

class A {
  constructor() {
    this.__key = [];
    this.__value = [];
  }
  setItem(key, value) {
    this.__key.push(key);
    this.__value.push(value);
  }
}

const bProto = {
  getItem(key) {
    const i = this.__key.indexOf(key);

    if (i !== -1) {
      return {
        key: this.__key[i],
        value: this.__value[i]
      };
    }
    return {};
  }
};

const a = new A();
a.setItem('foo', 'bar');

Object.assign(a.__proto__, bProto);

assert(a.getItem('foo').value === 'bar', 'Proto not extended correctly');
