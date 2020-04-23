'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async to() {
    const { helper, app, args, service, socket } = this.ctx;
    const message = args[0];

    // typeu is identify field
    // 1: c2c get socketId from redis
    // 2: c2g groupId is equivalent to roomId
    const toSocketIds = [];
    switch (message.typeu) {
      case 1: {
        const cooked = await service.io.client.getCooked(message.to);
        Object.keys(cooked).forEach(item => {
          toSocketIds.push(cooked[item]);
        });
        break;
      }
      case 2: {
        toSocketIds.push(`${app.config.ROOMPREFIX}${message.to}`);
        break;
      }
      default:
        return;
    }
    // escape the content
    const escapeMessage = { ...message, ...{ content: helper.escapeString(message.content) } };

    toSocketIds.forEach(socketId => {
      socket.to(socketId).emit(
        app.config.emitsheet.CHAT_MESSAGE,
        helper.parseIOMsg('CHAT_MESSAGE', { ...escapeMessage }, 'success')
      );
    });
  }
}

module.exports = ChatController;
