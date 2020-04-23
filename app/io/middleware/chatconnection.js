'use strict';


module.exports = app => {
  return async (ctx, next) => {
    const { socket, logger, service, helper } = ctx;
    const { token, userId } = socket.handshake.query;
    const deviceType = helper.getDeviceType(socket.request.headers['user-agent']);

    logger.info(`[CHAT] SOCKET_ID: ${socket.id} with token: ${token} has connection!`);
    logger.info('[CHAT] now authentication the token');

    const authOK = await service.io.chat.checkAuthToken(token);

    if (!authOK) {
      helper.emitError(socket, app.config.errorCode.AUTH_FAILED);
      helper.lazyCloseSocket(socket);
      return;
    }
    // push user to client list
    service.io.client.push(socket, userId, deviceType);

    // socket.join group
    service.io.group.joinGroup(socket, userId);

    await next();
    // pop user to client list
    service.io.client.pop(socket, userId, deviceType);
    console.log('disconnect');
  };
};
