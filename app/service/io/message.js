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
    const { helper } = this.ctx;
    const messageDocument = new this.ctx.model.MessageSync({
      timelineId: helper.generateTimelineId(params.from, params.to),
      owner: params.to,
      from: params.from,
      typeu: params.typeu,
      message: params._id,
    });

    return await messageDocument.save();
  }

  // 群消息-扩展写
  async saveCacheMultiple(members, params) {
    const { helper } = this.ctx;
    const insertDocuments = members.map(item => (
      {
        timelineId: helper.generateTimelineId(params.from, item),
        owner: item,
        from: params.from,
        typeu: params.typeu,
        message: params._id,
      }
    ));

    return await this.ctx.model.MessageSync.insertMany(insertDocuments);
  }

  async findOwnerOfflineMessages(owner) {
    return await this.ctx.model.MessageSync.find({ owner });
  }
}

module.exports = MessageService;
