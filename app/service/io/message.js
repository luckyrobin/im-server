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

  async saveCache(params) {

  }
}

module.exports = MessageService;
