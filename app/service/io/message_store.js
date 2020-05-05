'use strict';

const Service = require('egg').Service;

class MessageStoreService extends Service {

  async save(params) {
    const messageDocument = new this.ctx.model.MessageStore({
      _id: params.id,
      from: params.from,
      to: params.to,
      type: params.type,
      content: params.content,
      typeu: params.typeu,
      sequenceId: params.sequenceId,
    });

    return await messageDocument.save();
  }
}

module.exports = MessageStoreService;
