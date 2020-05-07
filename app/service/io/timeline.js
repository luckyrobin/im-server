'use strict';

const Service = require('egg').Service;

class TimelineService extends Service {

  async save(params) {
    const { helper, model } = this.ctx;
    let alias = '';
    let avatar = '';
    if (params.typeu === 1) {
      const user = await model.User.findById(params.to, { name: 1, _id: 0 });
      alias = user.name;
      avatar = user.avatar;
    } else if (params.typeu === 2) {
      const group = await model.Group.findById(params.to, { name: 1, _id: 0 });
      alias = group.name;
      avatar = group.avatar;
    }
    const timelineDocument = new this.ctx.model.Timeline({
      _id: helper.generateTimelineId(params.from, params.to),
      owner: params.from,
      to: params.to,
      typeu: params.typeu,
      alias,
      avatar,
      messageId: params._id,
    });
    return await timelineDocument.save();
  }

  async updateRecentMessage(params) {
    const { helper, model } = this.ctx;
    return await model.Timeline.findByIdAndUpdate(
      helper.generateTimelineId(params.from, params.to),
      { messageId: params._id }
    );
  }

  async findOwnerConversations(owner) {
    return await this.ctx.model.Timeline.find({ owner });
  }
}

module.exports = TimelineService;
