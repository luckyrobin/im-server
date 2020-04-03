'use strict';

const Service = require('egg').Service;

class SSOService extends Service {
  /**
   * save the device_id to redis
   * @param {string} deviceID
   * @param {string} socketID
   */
  async cacheSocket(deviceID, socketID) {
    const { app } = this;
    await app.redis.set(deviceID, socketID);
  }

  /**
   * remove the device_id from redis
   * @param {string} deviceID
   */
  async deCacheSocket(deviceID) {
    const { app } = this;
    await app.redis.del(deviceID);
  }
}

module.exports = SSOService;
