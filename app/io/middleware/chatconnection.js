'use strict';


module.exports = app => {
  return async (ctx, next) => {
    const { socket, logger, service, helper } = ctx;
    const { token, userId, deviceType } = socket.handshake.query;
    const dt = helper.getDeviceType(deviceType);

    if (!token || !userId || !deviceType) {
      ctx.emitError(socket, app.config.errorCode.MISS_PARAMS, '[CHAT] connect failed, missing params in query');
      ctx.lazyCloseSocket(socket);
      return;
    }

    if (!dt) {
      ctx.emitError(socket, app.config.errorCode.MISS_PARAMS, '[CHAT] connect failed, current deviceType is not support');
      ctx.lazyCloseSocket(socket);
      return;
    }

    logger.info(`[CHAT] SOCKET_ID: ${socket.id} with useId: ${userId} has connection!`);

    const authOK = await service.io.chat.checkAuthToken(token);

    if (!authOK) {
      ctx.emitError(socket, app.config.errorCode.RE_LOGIN, 'token is invalid or expired');
      ctx.lazyCloseSocket(socket);
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
