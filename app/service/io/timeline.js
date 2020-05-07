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
    const timelineDocument = new this.ctx.model.RecentTimelines({
      timelineId: helper.generateTimelineId(params.from, params.to),
      owner: params.from,
      to: params.to,
      typeu: params.typeu,
      alias,
      avatar,
      message: params._id,
    });
    return await timelineDocument.save();
  }

  async updateRecentMessage(params) {
    const { helper, model } = this.ctx;
    const query = { timelineId: helper.generateTimelineId(params.from, params.to) };
    return await model.RecentTimelines.findOneAndUpdate(query, { message: params._id });
  }
}

module.exports = TimelineService;
