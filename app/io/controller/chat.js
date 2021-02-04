'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async to() {
    const { app, service, socket } = this.ctx;
    const message = this.ctx.packet[1];
    const escapeMessage = { ...message, ...{ content: message.content } };
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
    let messages = this.ctx.packet[1];
    // 由于 flutter 无法直接发送数组类型数据，所以约定把结果包在 { data: [] } 里
    if (Reflect.has(messages, 'data')) {
      messages = messages.data;
    }
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
      app.gateway.CHAT_PULL_HISTORY_MESSAGE(this.ctx, socket.id, helper.parseIOMsg('CHAT_PULL_HISTORY_MESSAGE', messagesList, 'success'));
    } else {
      userId = request.userId;
      params = request.body;
      const messagesList = await this._getHistoryMessage.call(this, userId, params);
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
      case 3: // eslint-disable-next-line no-fallthrough
      case 4: {
        historyMessages = await service.io.message.findOwnerHistoryMessages(userId, params);
        break;
      }
      default:
        return [];
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
    const willSend = {
      _id: storeMessage._id,
      timelineId: storeMessage.timelineId,
      typeu: storeMessage.typeu,
      readed: storeMessage.readed,
      fp: message.fp,
    };
    // 如果推送已读状态时，接收方不在线，就将已读回执缓存起来
    if (toSocketIds.length === 0) {
      const { redis, config } = app;
      await redis.rpush(`${config.readedListPrefix}${message.from}`, JSON.stringify(willSend));
    }
    toSocketIds.forEach(socketId => {
      app.gateway.CHAT_TO_READED(this.ctx, socketId, helper.parseIOMsg('CHAT_TO_READED', [ willSend ], 'success'));
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

    // Hard coded 为了保证 App 端能够区分文本消息和非文本消息
    // type === 1 就是文本消息, 所以返回的撤回消息 type === 10, 其他, 则返回的撤回消息 type === 21
    const recallType = message.type === 1 ? 10 : 21;

    const recalledMessage = await service.io.message.recallStoreMessageByFp(userId, message.fp, recallType);
    service.io.chat.ackAndSync(recalledMessage, socket.handshake.query);
    service.io.chat.to(recalledMessage, socket.handshake.query);
  }

  async upload() {
    const { app, request, helper, HttpError } = this.ctx;
    const { userId } = request;
    try {
      const stream = await this.ctx.getFileStream();
      const type = helper.parseFileMimeType(stream);
      if (!type) throw new HttpError(this.app.config.errorCode.FILE_ERROR, 'file type unidentification');
      const filename = `chat/${userId}/${new Date().getTime()}_.${type === 2 ? 'pic' : ''}${type === 3 ? 'wav' : ''}`;
      const result = await app.oss.instance.put(filename, stream);
      this.ctx.body = {
        code: 0,
        msg: 'ok',
        data: await helper.genMessageTypeField(stream, result, type),
      };
    } catch (e) {
      this.ctx.body = {
        code: e.code || 1,
        msg: e.message,
      };
    }
  }

  async getReadedList() {
    const { app, socket, helper } = this.ctx;
    const { userId } = socket.handshake.query;
    const { redis } = app;
    const existedList = await redis.lrange(`${app.config.readedListPrefix}${userId}`, 0, -1);
    app.gateway.CHAT_TO_READED(this.ctx, socket.id, helper.parseIOMsg('CHAT_TO_READED', existedList.map(i => JSON.parse(i)), 'success'));
    await redis.del(`${app.config.readedListPrefix}${userId}`);
  }
}

module.exports = ChatController;
