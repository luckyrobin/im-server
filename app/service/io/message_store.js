'use strict';

const Service = require('egg').Service;

class MessageStoreService extends Service {

  async save(params) {
    const messageDocument = new this.ctx.model.MessageStore({
      _id: params._id,
      from: params.from,
      to: params.to,
      type: params.type,
      content: params.content,
      typeu: params.typeu,
      sequenceId: params.sequenceId,
    });

    const message = await messageDocument.save();

    return {
      _id: message._id,
      from: message.from,
      to: message.to,
      type: message.type,
      content: message.content,
      typeu: message.typeu,
      sequenceId: message.sequenceId,
      send_time: message.send_time,
      timelineId: message.timelineId,
    };
  }
}

module.exports = MessageStoreService;
