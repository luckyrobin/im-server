'use strict';

module.exports = () => {
  return async (ctx, next) => {
    // socket is interacting with browser clients
    const { socket, logger, service, helper } = ctx;
    const { device_id } = socket.handshake.query;
    if (!device_id) {
      // socket.emit('error', '[SSO] connect failure, missing device_id in query');
      helper.lazyCloseSocket(socket, '[SSO] connect failure');
      next(new Error('[SSO] connect failure, missing device_id in query'));
      return;
    }
    service.io.sso.cacheSocket(device_id, socket.id);
    logger.info(`[SSO] SOCKET_ID: ${socket.id} with DEVICE_ID: ${device_id} has connection!`);

    await next();
    // execute when disconnect.
    service.io.sso.deCacheSocket(device_id);
    logger.info(`[SSO] SOCKET_ID: ${socket.id} with DEVICE_ID: ${device_id} has disconnection!`);
  };
};
