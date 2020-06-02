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
    const { app, socket, helper, request } = this.ctx;
    let userId = '';
    let params = {};
    // 合并 socket 和 http 请求操作
    if (socket.handshake) {
      userId = socket.handshake.query.userId;
      params = this.ctx.packet[1];
      const messagesList = await this._getHistoryMessage.call(this, userId, params);
      if (!messagesList) return;
      app.gateway.CHAT_PULL_HISTORY_MESSAGE(this.ctx, socket.id, helper.parseIOMsg('CHAT_PULL_HISTORY_MESSAGE', messagesList, 'success'));
    } else {
      userId = request.userId;
      params = request.body;
      const messagesList = await this._getHistoryMessage.call(this, userId, params);
      if (!messagesList) return;
      this.ctx.body = {
        code: 0,
        data: messagesList,
        msg: 'ok',
      };
    }
  }

  async _getHistoryMessage(userId, params) {
    const { service } = this.ctx;
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
        return false;
    }
    return historyMessages;
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

  async undo() {
    const { socket, service } = this.ctx;
    const { userId } = socket.handshake.query;
    const message = this.ctx.packet[1];
    const recalledMessage = await service.io.message.recallStoreMessageByFp(userId, message.fp);
    service.io.chat.to(recalledMessage);
  }
}

module.exports = ChatController;
