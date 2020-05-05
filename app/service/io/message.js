'use strict';

const Service = require('egg').Service;

class MessageService extends Service {

  async saveDB(params) {
    const messageDocument = new this.ctx.model.MessageStore({
      _id: params._id,
      from: params.from,
      to: params.to,
      type: params.type,
      content: params.content,
      typeu: params.typeu,
      sequenceId: params.sequenceId,
    });

    return await messageDocument.save();
  }

  async saveCache(params) {

  }
}

module.exports = MessageService;
