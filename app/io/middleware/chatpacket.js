'use strict';

module.exports = app => {
  return async (ctx, next) => {
    const { socket, logger, service } = ctx;
    const emitName = ctx.packet[0];
    if (emitName === app.config.emitsheet.CHAT_TO) {
      const message = ctx.packet[1];
      if (message.typeu === 2) {
        const inGroup = await service.io.chat.checkUserInGroup(message.from, message.to);
        console.log(inGroup);
        if (!inGroup) {
          logger.error(`[CHAT] failure: ${message.from} is not members of group ${message.to}`);
          socket.emit('error', `[CHAT] failure: ${message.from} is not members of group ${message.to}`);
          return false;
        }
      }
    }
    await next();
  };
};
