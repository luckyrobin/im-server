'use strict';

const Service = require('egg').Service;

class SSOService extends Service {
  /**
   * save the device_id to redis
   * @param {string} deviceId
   * @param {EventListenerOrEventListenerObject} socket
   */
  async cacheSocket(deviceId, socket) {
    const self = this;
    const { app } = this;
    await app.redis.set(deviceId, socket.id);
    await app.redis.expire(deviceId, 60);
    setTimeout(function() {
      self.ctx.lazyCloseSocket(socket);
    }, 1000 * 60);
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
