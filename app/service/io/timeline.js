'use strict';

const Service = require('egg').Service;

class TimelineService extends Service {

  async create(params) {
    const { helper, model } = this.ctx;
    const senderDocument = {
      _id: helper.generateTimelineId(params.from, params.to),
      owner: params.from,
      to: params.to,
      typeu: params.typeu,
      alias: '',
      avatar: '',
      message: params._id,
    };

    const receiverDocument = {
      _id: helper.generateTimelineId(params.to, params.from),
      owner: params.to,
      to: params.from,
      typeu: params.typeu,
      alias: '',
      avatar: '',
      message: params._id,
    };

    const sender = await model.User.findById(senderDocument.to, { name: 1, avatar: 1, _id: 0 });
    const receiver = await model.User.findById(receiverDocument.to, { name: 1, avatar: 1, _id: 0 });
    senderDocument.alias = sender.name;
    senderDocument.avatar = sender.avatar;
    receiverDocument.alias = receiver.name;
    receiverDocument.avatar = receiver.avatar;

    return await this.ctx.model.Timeline.insertMany([ senderDocument, receiverDocument ]);
  }

  async createBatch(params) {
    const { helper, service, model } = this.ctx;

    const roleDocuments = [];
    const groupMembers = await service.io.group.findMembers(params.to);
    if (!groupMembers) return false;
    const group = await model.Group.findById(params.to, { name: 1, avatar: 1, _id: 0 });
    groupMembers.members.forEach(item => {
      roleDocuments.push({
        _id: helper.generateTimelineId(item, params.to),
        owner: item,
        to: params.to,
        typeu: params.typeu,
        alias: group.name,
        avatar: group.avatar,
        message: params._id,
      });
    });

    return await this.ctx.model.Timeline.insertMany(roleDocuments);
  }

  async updateRecentMessage(params) {
    const { helper, model } = this.ctx;
    const query = {
      $or: [
        { _id: helper.generateTimelineId(params.from, params.to) },
        { _id: helper.generateTimelineId(params.to, params.from) },
      ],
    };
    return await model.Timeline.updateMany(query, { message: params._id });
  }

  async updateRecentMessageBatch(params) {
    const { helper, model, service } = this.ctx;
    const updateDocuments = [];

    const groupMembers = await service.io.group.findMembers(params.to);
    if (!groupMembers) return false;

    groupMembers.members.forEach(item => {
      updateDocuments.push({
        _id: helper.generateTimelineId(item, params.to),
      });
    });

    const query = {
      $or: updateDocuments,
    };

    return await model.Timeline.updateMany(query, { message: params._id });
  }

  async findOwnerConversations(owner) {
    return await this.ctx.model.Timeline.find({ owner });
  }

  async updateOneById(params) {
    const { _id, ...otherParams } = params;
    return await this.ctx.model.Timeline.updateOne({ _id }, { ...otherParams });
  }
}

module.exports = TimelineService;
