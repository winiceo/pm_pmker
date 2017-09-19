'use strict';

const LRU = Symbol('Application#lru');
const LRUCache = require('ylru');

const PUB = Symbol('Application#pub');
const nrp = require('../lib/pubsub');

module.exports = {
  get lru() {
    if (!this[LRU]) {
      this[LRU] = new LRUCache(1000);
    }
    return this[LRU];
  },
  get event() {
    // this 就是 app 对象，在其中可以调用 app 上的其他方法，或访问属性
    if (!this[PUB]) {
      // 实际情况肯定更复杂
      this[PUB] = new nrp(this.config.redis.client);
    }
    return this[PUB];
  },
};
