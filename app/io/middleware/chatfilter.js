'use strict';

/**
 * 常规 typeu 字段 -> 1: c2c 消息 2: c2g 消息 3: 系统消息 4: 公告消息
 * 非 1 或 2 则为非常规消息类型，例如系统消息和公告消息
 */
const NORMAL_TYPEU = [ 1, 2 ];

module.exports = app => {
  return async (ctx, next) => {
    const { socket, service } = ctx;
    const emitName = ctx.packet[0];

    // middleware -> EventName: CHAT_TO
    if (emitName === app.config.emitsheet.CHAT_TO) {
      const message = ctx.packet[1];
      // 鉴别当前用户是否属于群成员
      if (message.typeu === 2) {
        const inGroup = await service.io.chat.checkUserInGroup(message.from, message.to);
        if (!inGroup) {
          ctx.emitError(socket, app.config.errorCode.CHAT_FAILED, `[CHAT] group is dissolved or you are not members of group ${message.to}`);
          return;
        }
      }
      // 非常规消息直接丢弃
      if (!NORMAL_TYPEU.includes(message.typeu)) return;
    }

    if (emitName === app.config.emitsheet.CHAT_TO_READED) {
      const message = ctx.packet[1];
      if (!message) return;
      const { userId } = socket.handshake.query;
      if (userId === message.from) return;
    }

    if (emitName === app.config.emitsheet.CHAT_PULL_HISTORY_MESSAGE) {
      const params = ctx.packet[1];
      const { userId } = socket.handshake.query;
      if (!Reflect.has(params, 'timelineId') || !Reflect.has(params, 'typeu')) {
        ctx.emitError(socket, app.config.errorCode.MISS_PARAMS, '[CHAT] missing timelineId or typeu params in query');
        return;
      }
      // 鉴别当前用户是否属于既定会话
      const conversation = params.timelineId.split('@');
      if (!conversation.includes(userId)) {
        ctx.emitError(socket, app.config.errorCode.AUTH_FAILED, '[CHAT] current conversation is not belong to you');
        return;
      }
    }

    if (emitName === app.config.emitsheet.CHAT_TO_TYPING) {
      const message = ctx.packet[1];
      if (!message) return;
      if (!NORMAL_TYPEU.includes(message.typeu)) return;
      if (!Reflect.has(message, 'typeu') || message.typeu !== 1) return;
    }

    if (emitName === app.config.emitsheet.CHAT_TO_UNDO) {
      const message = ctx.packet[1];
      if (!message) return;
      if (!NORMAL_TYPEU.includes(message.typeu)) return;
    }

    if (emitName === app.config.emitsheet.CHAT_MESSAGE_ACK) {
      const message = ctx.packet[1];
      if (!message) return;
    }

    await next();
  };
};
