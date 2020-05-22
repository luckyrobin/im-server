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
    const { socket, service } = this.ctx;
    const { userId } = socket.handshake.query;
    const messages = this.ctx.packet[1];
    await service.io.message.updateSyncMessageStatus(userId, messages);
  }

  async getHistoryMessage() {
    const { app, service, socket, helper } = this.ctx;
    const { userId } = socket.handshake.query;
    const params = this.ctx.packet[1];

    let historyMessages = [];
    switch (params.typeu) {
      case 1: {
        historyMessages = await service.io.message.findOwnerHistoryMessages(userId, params);
        break;
      }
      case 2: {
        historyMessages = await service.io.message.findGroupHistoryMessages(userId, params);
        break;
      }
      default:
        return;
    }
    app.gateway.CHAT_PULL_HISTORY_MESSAGE(this.ctx, socket.id, helper.parseIOMsg('CHAT_PULL_HISTORY_MESSAGE', historyMessages, 'success'));
  }

  async markReader() {
    const { app, service, socket, helper } = this.ctx;
    const { userId } = socket.handshake.query;
    const message = this.ctx.packet[1];

    const storeMessage = await service.io.message.updateStoreMessageStatus(userId, message);

    const toSocketIds = [];
    const cooked = await this.ctx.ioClient.getCooked(message.from);
    Object.keys(cooked).forEach(item => {
      toSocketIds.push(cooked[item]);
    });
    toSocketIds.forEach(socketId => {
      app.gateway.CHAT_TO_READED(this.ctx, socketId, helper.parseIOMsg('CHAT_TO_READED', {
        _id: storeMessage._id,
        timelineId: storeMessage.timelineId,
        typeu: storeMessage.typeu,
        readed: storeMessage.readed,
        fp: message.fp,
      }, 'success'));
    });
  }

  async markTyping() {
    const { app, socket, helper } = this.ctx;
    const { userId } = socket.handshake.query;
    const message = this.ctx.packet[1];

    const toSocketIds = [];
    const cooked = await this.ctx.ioClient.getCooked(message.to);
    Object.keys(cooked).forEach(item => {
      toSocketIds.push(cooked[item]);
    });
    toSocketIds.forEach(socketId => {
      app.gateway.CHAT_TO_TYPING(this.ctx, socketId, helper.parseIOMsg('CHAT_TO_TYPING', {
        timelineId: helper.generateTimelineId(message.to, userId),
        from: userId,
      }, 'success'));
    });
  }
}

module.exports = ChatController;
