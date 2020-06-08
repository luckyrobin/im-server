'use strict';

const Service = require('egg').Service;

const MSG_TYPE = {
  3: {
    alias: '系统消息',
    avatar: '//wh-qd-group.oss-cn-zhangjiakou.aliyuncs.com/avatar/note.png',
  },
  4: {
    alias: '公告',
    avatar: '//wh-qd-group.oss-cn-zhangjiakou.aliyuncs.com/avatar/notice.png',
  },
};

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

    return await model.Timeline.insertMany([ senderDocument, receiverDocument ]);
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

    return await model.Timeline.insertMany(roleDocuments);
  }

  async merge4Whole(params) {
    const { helper, service, model } = this.ctx;

    const wholeUser = await service.user.findAllUser();
    const roleDocuments = [];
    const updateDocuments = [];

    await Promise.all(wholeUser.map(async item => {
      const owner = item._id;
      const hasCreated = await service.io.timeline.findById(helper.generateTimelineId(owner, params.to));
      return new Promise(resolve => {
        if (!hasCreated) {
          roleDocuments.push({
            _id: helper.generateTimelineId(owner, params.to),
            owner,
            to: params.to,
            typeu: params.typeu,
            alias: MSG_TYPE[params.typeu].alias,
            avatar: MSG_TYPE[params.typeu].avatar,
            message: params._id,
          });
        } else {
          updateDocuments.push({
            _id: helper.generateTimelineId(owner, params.to),
          });
        }
        resolve();
      });
    }));

    roleDocuments.length > 0 && await model.Timeline.insertMany(roleDocuments);
    updateDocuments.length > 0 && await model.Timeline.updateMany({ $or: updateDocuments }, { message: params._id });
  }

  async createByStatic(baseDataList) {
    const { helper, model } = this.ctx;
    if (Array.isArray(baseDataList) && baseDataList.length > 0) {
      const group = await model.Group.findById(baseDataList[0].to, { name: 1, avatar: 1, _id: 0 });
      const roleDocuments = [];
      await Promise.all(baseDataList.map(async item => {
        const existed = await model.Timeline.exists({ _id: helper.generateTimelineId(item.from, item.to) });
        return new Promise(resolve => {
          !existed && roleDocuments.push({
            _id: helper.generateTimelineId(item.from, item.to),
            owner: item.from,
            to: item.to,
            typeu: item.typeu,
            alias: group.name,
            avatar: group.avatar,
          });
          resolve();
        });
      }));
      return await model.Timeline.insertMany(roleDocuments);
    }
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

  async findById(id) {
    return await this.ctx.model.Timeline.findById(id);
  }

  async updateOneById(params) {
    const { _id, ...otherParams } = params;
    return await this.ctx.model.Timeline.updateOne({ _id }, { ...otherParams });
  }

  async updateAlias(toId, alias) {
    return await this.ctx.model.Timeline.updateMany({ to: toId }, { alias });
  }
}

module.exports = TimelineService;
