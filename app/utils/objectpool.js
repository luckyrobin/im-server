'use strict';

const DEFAULT = {
  POOL_SIZE: 100,
};

class ObjectPool {
  constructor(options) {
    this.options = { DEFAULT, ...options };
    this.traversePool = {};
    this.pool = [];
  }

  get(key, fn) {
    if (!Reflect.has(this.traversePool, key)) {
      this.traversePool[key] = fn;
      this.pool.push(key);
      if (this.pool.length >= this.options.POOL_SIZE) {
        this.release();
      }
    }
    return this.traversePool[key];
  }

  release(k) {
    let key = '';
    if (k) {
      key = k;
      this.pool.splice(this.pool.indexOf(key), 1);
    } else {
      key = this.pool.shift();
    }
    Reflect.deleteProperty(this.traversePool, key);
  }
}

module.exports = ObjectPool;
