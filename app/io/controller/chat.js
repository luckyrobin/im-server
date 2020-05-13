'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async to() {
    const { app, service, socket, helper } = this.ctx;
    const message = this.ctx.packet[1];
    const escapeMessage = { ...message, ...{ content: helper.escapeString(message.content) } };
    escapeMessage.requestQuery = socket.handshake.query;
    return service.io.mq.send(app.config.globalchannel, JSON.stringify(escapeMessage));
  }

  async getRecentConversations() {
    const { app, service, socket, helper } = this.ctx;
    const { userId } = socket.handshake.query;
    const recentConversations = await service.io.timeline.findOwnerConversations(userId);
    app.gateway.CHAT_PULL_RECENT_CONVERSATION(this.ctx, socket.id, helper.parseIOMsg('CHAT_PULL_RECENT_CONVERSATION', recentConversations, 'success'));
  }

  async getOfflineMessages() {
    const { app, service, socket, helper } = this.ctx;
    const { userId } = socket.handshake.query;
    const offlineMessages = await service.io.message.findOwnerOfflineMessages(userId);
    app.gateway.CHAT_PULL_OFFLINE_MESSAGE(this.ctx, socket.id, helper.parseIOMsg('CHAT_PULL_OFFLINE_MESSAGE', offlineMessages, 'success'));
  }

  async clientHasReceived() {
    const { socket } = this.ctx;
    const { userId } = socket.handshake.query;
    const messages = this.ctx.packet[1];
    await this.ctx.service.io.message.updateSyncMessageStatus(userId, messages);
  }
}

module.exports = ChatController;
