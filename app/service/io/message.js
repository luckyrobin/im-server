'use strict';

const Service = require('egg').Service;

class MessageService extends Service {

  async saveDB(params) {
    const { helper } = this.ctx;
    const messageDocument = new this.ctx.model.MessageStore({
      timelineId: helper.generateTimelineId(params.from, params.to),
      from: params.from,
      to: params.to,
      type: params.type,
      content: params.content,
      typeu: params.typeu,
      sequenceId: params.sequenceId,
    });

    return await messageDocument.save();
  }

  // 如果是群消息--扩展写
  async saveCache(params, members) {
    const insertDocuments = [];

    if (Array.isArray(members)) {
      members.forEach(item => {
        insertDocuments.push({
          timelineId: params.timelineId,
          owner: item,
          from: params.from,
          typeu: params.typeu,
          message: params._id,
        });
      });
    } else {
      insertDocuments.push({
        timelineId: params.timelineId,
        owner: params.to,
        from: params.from,
        typeu: params.typeu,
        message: params._id,
      });
    }

    return await this.ctx.model.MessageSync.insertMany(insertDocuments);
  }

  async findOwnerOfflineMessages(owner) {
    return await this.ctx.model.MessageSync.find({ owner, delivered: false });
  }

  async updateSyncMessageStatus(owner, msg) {
    // 1. 如果 msg 是数组，表示离线消息推送成功，并且确认用户收到
    // 2. 非数组，表示在线用户确认收到消息
    if (Array.isArray(msg) && msg.length > 0) {
      const interior = msg.map(item => ({ timelineId: item.message.timelineId, message: item.message._id }));
      const query = {
        owner,
        $or: [ ...interior ],
      };
      return await this.ctx.model.MessageSync.updateMany(query, { delivered: true });
    }
    return await this.ctx.model.MessageSync.updateOne({ owner, timelineId: msg.timelineId, message: msg._id }, { delivered: true });
  }

  async findOwnerHistoryMessages(owner, params) {
    const { model, helper } = this.ctx;
    const limit = params.limit || 10;

    if (!params.messageId) {
      const conversation = helper.parseTimelineId(params.timelineId);
      return await model.MessageStore.find({
        $and: [
          {
            $or: [
              { timelineId: helper.generateTimelineId(conversation.from, conversation.to) },
              { timelineId: helper.generateTimelineId(conversation.to, conversation.from) },
            ],
          },
          {
            send_time: {
              $lte: Date.now(),
            },
          },
        ],
      }).limit(limit).sort('-sequenceId');
    }

    const currentMessage = await model.MessageStore.findById(params.messageId);
    return await model.MessageStore.find({
      $and: [
        {
          $or: [
            { timelineId: helper.generateTimelineId(currentMessage.from, currentMessage.to) },
            { timelineId: helper.generateTimelineId(currentMessage.to, currentMessage.from) },
          ],
        },
        {
          send_time: {
            $lt: currentMessage.send_time,
          },
        },
      ],
    }).limit(limit).sort('-sequenceId');
  }

  async findGroupHistoryMessages(owner, params) {
    const { model, helper } = this.ctx;
    const limit = params.limit || 10;

    if (!params.messageId) {
      const conversation = helper.parseTimelineId(params.timelineId);
      return await model.MessageStore.find({
        $and: [
          {
            to: conversation.to,
          },
          {
            send_time: {
              $lte: Date.now(),
            },
          },
        ],
      }).limit(limit).sort('-sequenceId');
    }

    const currentMessage = await model.MessageStore.findById(params.messageId);
    return await model.MessageStore.find({
      $and: [
        {
          to: currentMessage.to,
        },
        {
          send_time: {
            $lt: currentMessage.send_time,
          },
        },
      ],
    }).limit(limit).sort('-sequenceId');
  }
}

module.exports = MessageService;
