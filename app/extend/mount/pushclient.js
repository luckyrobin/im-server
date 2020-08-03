'use strict';

const PUSHLIST = 'pushclient';

class PushClient {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async push(userId, deviceId) {
    const { app } = this.ctx;
    const { redis } = app;
    await redis.hset(PUSHLIST, userId, deviceId);
  }

  async pop(userId) {
    const { app } = this.ctx;
    const { redis } = app;
    await redis.hdel(PUSHLIST, userId);
  }

  async get(...args) {
    const { redis } = this.ctx.app;
    const userId = [ ...args ];
    if (userId.length === 1) {
      return await redis.hget(PUSHLIST, userId[0]);
    }
    return await redis.hmget(PUSHLIST, ...userId);
  }
}

module.exports = PushClient;
