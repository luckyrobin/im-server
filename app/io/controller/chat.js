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
    if (!Reflect.has(params, 'timelineId') || !Reflect.has(params, 'typeu')) {
      helper.emitError(socket, app.config.errorCode.MISS_PARAMS, '[CHAT] missing timelineId or typeu params in query');
      return;
    }
    // 鉴别当前用户是否属于既定会话
    const conversation = params.timelineId.split('@');
    if (!conversation.includes(userId)) {
      helper.emitError(socket, app.config.errorCode.AUTH_FAILED, '[CHAT] current conversation is not belong to you');
      return;
    }
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
}

module.exports = ChatController;
