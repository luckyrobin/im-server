'use strict';

const Service = require('egg').Service;

const CLIENTLIST = 'clientlist';

class clientService extends Service {

  async push(socket, userId, deviceType) {
    const { logger, helper, app } = this.ctx;
    const { redis, config } = app;
    const socketId = socket.id;

    if (await this.isOnline(userId)) {
      const previousSocketId = await redis.hget(CLIENTLIST, userId);
      // duplicate socket
      if (previousSocketId === socketId) {
        logger.info('[CHAT] socket is duplicate');
      } else {
        const previousSocket = app.io.of('/chat').sockets[previousSocketId];
        helper.lazyCloseSocket(previousSocket);
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

  async pop(userId, deviceType) {
    const { logger, helper, app } = this.ctx;
    const { redis, config } = app;

    if (await !this.isOnline(userId)) {
      logger.error(`[CHAT] client: ${userId} is pop failed`);
      return;
    }
    await redis.hdel(CLIENTLIST, userId);

    const clientsOnline = await redis.hkeys(CLIENTLIST);
    // broadcast to all client online list
    app.io.of('/chat').emit(
      config.emitsheet.CHAT_ONLINE,
      helper.parseIOMsg('CHAT_ONLINE', { type: 'offline', clients: clientsOnline, current: userId }, 'success')
    );
  }

  async get(...args) {
    const { redis } = this.ctx.app;
    const userId = [ ...args ];
    if (userId.length === 1) {
      return await redis.hget(CLIENTLIST, userId[0]);
    }
    return await redis.hmget(CLIENTLIST, ...userId);
  }

  async isOnline(userId) {
    const { redis } = this.ctx.app;
    return await redis.hexists(CLIENTLIST, userId) === 1;
  }
}

module.exports = clientService;

