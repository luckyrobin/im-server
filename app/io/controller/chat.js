'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async to() {
    const { helper, app, args, service, socket } = this.ctx;
    const message = args[0];

    // typeu is identify field
    // 1: c2c get socketId from redis
    // 2: c2g groupId is equivalent to roomId
    const toId = message.typeu === 1 ? await service.io.client.get(message.to) : `${app.config.ROOMPREFIX}${message.to}`;

    // escape the content
    const escapeMessage = { ...message, ...{ content: helper.escapeString(message.content) } };

    socket.to(toId).emit(
      app.config.emitsheet.CHAT_MESSAGE,
      helper.parseIOMsg('CHAT_MESSAGE', { ...escapeMessage }, 'success')
    );
  }

  async synchronous() {
    
  }
}

module.exports = ChatController;
