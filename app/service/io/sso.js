'use strict';

const Service = require('egg').Service;

class SSOService extends Service {
  /**
   * save the device_id to redis
   * @param {string} deviceId
   * @param {string} socketId
   */
  async cacheSocket(deviceId, socketId) {
    const { app } = this;
    await app.redis.set(deviceId, socketId);
  }

  /**
   * remove the device_id from redis
   * @param {string} deviceId
   */
  async deCacheSocket(deviceId) {
    const { app } = this;
    await app.redis.del(deviceId);
  }
}

module.exports = SSOService;
