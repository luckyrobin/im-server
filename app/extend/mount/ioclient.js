'use strict';

const CLIENTLIST = 'ioclient';

const parseRaw = (raw, deviceType) => {
  if (deviceType) {
    return JSON.parse(raw)[deviceType];
  }
  return JSON.parse(raw);
};

const stringify2Raw = cooked => JSON.stringify(cooked);

class IOClient {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async push(socket, userId, deviceType) {
    const { logger, helper, app } = this.ctx;
    const { redis } = app;
    const socketId = socket.id;

    // userID is existed?
    if (await this.isOnline(userId)) {
      const cooked = parseRaw(await this.get(userId));
      const previousSocketId = Reflect.get(cooked, deviceType);
      if (previousSocketId) {
        // duplicate socket
        // else
        // kicked out
        if (previousSocketId === socketId) {
          logger.info('[CHAT] socket is duplicate');
        } else {
          try {
            const previousSocket = app.io.of('/chat').sockets[previousSocketId];
            previousSocket && this.ctx.emitError(previousSocket, app.config.errorCode.DUPLICATE_CLIENT);
            previousSocket && this.ctx.lazyCloseSocket(previousSocket);
          } catch (e) {
            logger.error('[CHAT] previousSocket is not existed');
          }
        }
      }

      const newCooked = {
        ...cooked,
        ...{
          [deviceType]: socketId,
        },
      };

      await redis.hset(CLIENTLIST, userId, stringify2Raw(newCooked));
    } else {
      const newCooked = {
        [deviceType]: socketId,
      };
      await redis.hset(CLIENTLIST, userId, stringify2Raw(newCooked));
    }

    const clientsOnline = await redis.hkeys(CLIENTLIST);
    // broadcast to all client online list
    app.gateway.CHAT_ONLINE(
      this.ctx,
      helper.parseIOMsg('CHAT_ONLINE', { type: 'online', clients: clientsOnline, current: userId }, 'success')
    );
  }

  async pop(socket, userId, deviceType) {
    const { logger, helper, app } = this.ctx;
    const { redis } = app;

    if (await !this.isOnline(userId)) {
      logger.debug(`[CHAT] client: ${userId} is pop failed`);
      return;
    }

    const cooked = parseRaw(await this.get(userId));

    if (!Reflect.get(cooked, deviceType)) {
      logger.debug(`[CHAT] client: ${userId} is pop failed`);
      return;
    }

    // verify that the current to be deleted
    if (Reflect.get(cooked, deviceType) !== socket.id) {
      logger.debug('[CHAT] client: the current socket is not matching');
      return;
    }

    Reflect.deleteProperty(cooked, deviceType);

    if (Reflect.ownKeys(cooked).length) {
      await redis.hset(CLIENTLIST, userId, stringify2Raw(cooked));
    } else {
      await redis.hdel(CLIENTLIST, userId);
    }

    const clientsOnline = await redis.hkeys(CLIENTLIST);
    // broadcast to all client online list
    app.gateway.CHAT_ONLINE(
      this.ctx,
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

  async getCooked(userId) {
    const raw = await this.get(userId);
    if (!raw) return 0;
    return parseRaw(raw);
  }
}

module.exports = IOClient;
