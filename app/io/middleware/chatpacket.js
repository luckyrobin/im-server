'use strict';

// multiterminal synchronization
const syncToOtherDevice = async (ctx, message) => {
  const { socket, service, helper, app } = ctx;
  const deviceType = helper.getDeviceType(socket.request.headers['user-agent']);
  const cooked = await service.io.client.getCooked(message.from);
  const otherDevice = Reflect.ownKeys(cooked).filter(item => item !== deviceType).join('');

  if (!otherDevice) return;
  // escape the content
  const escapeMessage = { ...message, ...{ content: helper.escapeString(message.content) } };

  socket.to(cooked[otherDevice]).emit(
    app.config.emitsheet.CHAT_MESSAGE,
    helper.parseIOMsg('CHAT_MESSAGE', { ...escapeMessage }, 'success', { sync: true })
  );
};

module.exports = app => {
  return async (ctx, next) => {
    const { socket, service, helper } = ctx;
    const emitName = ctx.packet[0];
    // middleware -> EventName: CHAT_TO
    if (emitName === app.config.emitsheet.CHAT_TO) {
      const message = ctx.packet[1];
      /*
      * typeu is identify field
      * 1: c2c get socketId from redis
      * 2: c2g groupId is equivalent to roomId
      */
      // 同步 c2c 消息，由于 c2g 消息是广播类型，所以不需要同步
      if (message.typeu === 1) {
        await syncToOtherDevice(ctx, message);
      }
      if (message.from === message.to) return;
      // 鉴别当前用户是否属于群成员
      if (message.typeu === 2) {
        const inGroup = await service.io.chat.checkUserInGroup(message.from, message.to);
        if (!inGroup) {
          helper.emitError(socket, app.config.errorCode.CHAT_FAILED, `[CHAT] failed: you are not members of group ${message.to}`);
          return;
        }
      }
    }
    await next();
  };
};
