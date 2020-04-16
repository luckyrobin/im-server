'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async to() {
    const { helper, app, args, service, socket } = this.ctx;
    const message = args[0];
    // escape the dataConent
    const escapeMessage = { ...message, ...{ dataContent: helper.escapeString(message.dataContent) } };
    const toSocketId = await service.io.client.get(escapeMessage.to);

    socket.to(toSocketId).emit(
      app.config.emitsheet.CHAT_MESSAGE,
      helper.parseIOMsg('CHAT_MESSAGE', { ...escapeMessage }, 'success')
    );
  }
}

module.exports = ChatController;
