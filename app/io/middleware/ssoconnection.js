'use strict';

module.exports = () => {
  return async (ctx, next) => {
    // socket is interacting with browser clients
    const { socket, app, logger } = ctx;
    const { device_id } = socket.handshake.query;
    logger.info(`SOCKET_ID: ${socket.id} with DEVICE_ID: ${device_id} has connection!`);
    // save the device_id to redis
    await app.redis.set(device_id, socket.id);

    await next();
    // execute when disconnect.
    // remove the device_id from redis
    await app.redis.del(device_id);
    logger.info(`SOCKET_ID: ${socket.id} with DEVICE_ID: ${device_id} has disconnection!`);
  };
};
