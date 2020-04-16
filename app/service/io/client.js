'use strict';

const Service = require('egg').Service;

const CLIENTLIST = 'clientlist';

class clientService extends Service {

  async push(userId, socket) {
    const { logger, helper, app } = this.ctx;
    const { redis, config } = app;
    const socketId = socket.id;
    if (redis.hexists(CLIENTLIST, userId) === 1) {
      const previousSocketId = redis.hget(CLIENTLIST, userId);
      // duplicate socket
      if (previousSocketId === socketId) {
        logger.info('[CHAT] socket is duplicate');
      } else {
        helper.lazyCloseSocket(previousSocketId, '[CHAT] duplicate socket');
      }
    }

    await redis.hset(CLIENTLIST, userId, socketId);

    const clientsOnline = await redis.hkeys(CLIENTLIST);
    // broadcast to all client online list
    app.io.of('/chat').emit(
      config.emitsheet.CHAT_ONLINE,
      helper.parseIOMsg('CHAT_ONLINE', { type: 'online', clients: clientsOnline, current: userId }, 'success')
    );
  }

  async pop(userId) {
    const { logger, helper, app } = this.ctx;
    const { redis, config } = app;

    if (redis.hexists(CLIENTLIST, userId) === 0) {
      logger.error(`[CHAT] client: ${userId} is pop failure`);
    }

    await redis.hdel(CLIENTLIST, userId);

    const clientsOnline = await redis.hkeys(CLIENTLIST);
    // broadcast to all client online list
    app.io.of('/chat').emit(
      config.emitsheet.CHAT_ONLINE,
      helper.parseIOMsg('CHAT_ONLINE', { type: 'offline', clients: clientsOnline, current: userId }, 'success')
    );
  }

  async get(userId) {
    const { redis } = this.ctx.app;
    return await redis.hget(CLIENTLIST, userId);
  }

  async isOnline(userId) {
    const { redis } = this.ctx.app;
    return redis.hexists(CLIENTLIST, userId) === 1;
  }
}

module.exports = clientService;

