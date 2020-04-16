'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async to() {
    const { helper, app, args, service, socket } = this.ctx;
    const message = args[0];
    // escape the dataConent
    const escapeMessage = { ...message, ...{ dataContent: helper.escapeString(message.dataContent) } };
    const toSocketId = await service.io.client.get(escapeMessage.to);

    // console.log('escapeMessage ========', escapeMessage);

    await service.message.saveSingleMessage(escapeMessage);

    await service.message.getMessageBefore({
      from: "5e97072c1057cd5732b00b59",
      to: "5e9709b81057cd5732b00b5e",
      target_id: "5e9744d039dc5162d43605c9",
      count: 2
    });
    socket.to(toSocketId).emit(
      app.config.emitsheet.CHAT_MESSAGE,
      helper.parseIOMsg('CHAT_MESSAGE', { ...escapeMessage }, 'success')
    );
  }
}

module.exports = ChatController;
