'use strict';

module.exports = app => {
  return async (ctx, next) => {
    // socket is interacting with browser clients
    const { socket, logger, service, helper } = ctx;
    const { device_id } = socket.handshake.query;

    if (!device_id) {
      helper.emitError(socket, app.config.errorCode.MISS_PARAMS, '[SSO] connect failed, missing device_id in query');
      helper.lazyCloseSocket(socket);
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
