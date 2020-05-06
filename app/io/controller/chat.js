'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async to() {
    const { app, service, socket } = this.ctx;
    const message = this.ctx.packet[1];
    message.requestQuery = socket.handshake.query;
    return service.io.mq.send(app.config.globalchannel, JSON.stringify(message));
  }
}

module.exports = ChatController;
