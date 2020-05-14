'use strict';

module.exports = app => {
  return async (ctx, next) => {
    const { socket, service, helper } = ctx;
    const emitName = ctx.packet[0];
    // middleware -> EventName: CHAT_TO
    if (emitName === app.config.emitsheet.CHAT_TO) {
      const message = ctx.packet[1];
      // 鉴别当前用户是否属于群成员
      if (message.typeu === 2) {
        const inGroup = await service.io.chat.checkUserInGroup(message.from, message.to);
        if (!inGroup) {
          helper.emitError(socket, app.config.errorCode.CHAT_FAILED, `[CHAT] failed: you are not members of group ${message.to}`);
          return;
        }
      }
    }

    if (emitName === app.config.emitsheet.CHAT_TO_READED) {
      const message = ctx.packet[1];
      const { userId } = socket.handshake.query;
      if (userId === message.from) return;
    }
    await next();
  };
};
