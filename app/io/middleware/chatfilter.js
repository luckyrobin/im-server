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
          helper.emitError(socket, app.config.errorCode.CHAT_FAILED, `[CHAT] group is dissolved or you are not members of group ${message.to}`);
          return;
        }
      }
    }

    if (emitName === app.config.emitsheet.CHAT_TO_READED) {
      const message = ctx.packet[1];
      const { userId } = socket.handshake.query;
      if (userId === message.from) return;
    }

    if (emitName === app.config.emitsheet.CHAT_PULL_HISTORY_MESSAGE) {
      const params = ctx.packet[1];
      const { userId } = socket.handshake.query;
      if (!Reflect.has(params, 'timelineId') || !Reflect.has(params, 'typeu')) {
        helper.emitError(socket, app.config.errorCode.MISS_PARAMS, '[CHAT] missing timelineId or typeu params in query');
        return;
      }
      // 鉴别当前用户是否属于既定会话
      const conversation = params.timelineId.split('@');
      if (!conversation.includes(userId)) {
        helper.emitError(socket, app.config.errorCode.AUTH_FAILED, '[CHAT] current conversation is not belong to you');
        return;
      }
    }

    if (emitName === app.config.emitsheet.CHAT_TO_TYPING) {
      const message = ctx.packet[1];
      if (message.typeu === 2) return;
    }

    await next();
  };
};
