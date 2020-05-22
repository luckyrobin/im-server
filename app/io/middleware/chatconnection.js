'use strict';


module.exports = app => {
  return async (ctx, next) => {
    const { socket, logger, service, helper } = ctx;
    const { token, userId, deviceType } = socket.handshake.query;
    const dt = helper.getDeviceType(deviceType);

    if (!token || !userId || !deviceType) {
      helper.emitError(socket, app.config.errorCode.MISS_PARAMS, '[CHAT] connect failed, missing params in query');
      return;
    }

    if (!dt) {
      helper.emitError(socket, app.config.errorCode.MISS_PARAMS, '[CHAT] connect failed, current deviceType is not support');
      return;
    }

    logger.info(`[CHAT] SOCKET_ID: ${socket.id} with token: ${token} has connection!`);
    logger.info('[CHAT] now authentication the token');

    const authOK = await service.io.chat.checkAuthToken(token);

    if (!authOK) {
      helper.emitError(socket, app.config.errorCode.AUTH_FAILED);
      helper.lazyCloseSocket(socket);
      return;
    }
    // push user to client list
    ctx.ioClient.push(socket, userId, dt);

    // socket.join group
    service.io.group.joinMineGroup(socket, userId);

    await next();
    // pop user to client list
    ctx.ioClient.pop(socket, userId, dt);
    console.log('disconnect');
  };
};
