'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async to() {
    const { helper, app, args, service, socket } = this.ctx;
    const message = args[0];

    const toSocketId = await service.io.client.get(message.to);
    socket.to(toSocketId).emit(
      app.config.emitsheet.CHAT_MESSAGE,
      helper.parseIOMsg(app.config.emitsheet.CHAT_MESSAGE, { ...message }, 'success')
    );
  }
}

module.exports = ChatController;
