'use strict';

module.exports = () => {
  return async (ctx, next) => {
    const { socket, logger, service, helper } = ctx;
    const { token } = socket.handshake.query;
    logger.info(`[CHAT] SOCKET_ID: ${socket.id} with ${token} has connection!`);
    logger.info(`[CHAT] now authentication the ${token}`);

    const authOK = await service.io.chat.checkAuthToken(token);

    if (!authOK) {
      helper.lazyCloseSocket(socket, '[CHAT] connect failure');
      next(new Error('[CHAT] connect failure, token has expired'));
      return;
    }

    await next();
    // execute when disconnect.
    console.log('disconnect');
  };
};
