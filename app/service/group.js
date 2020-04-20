'use strict';

const Service = require('egg').Service;

class GroupService extends Service {

  async create(params) {
    const groupInstance = new this.ctx.model.Group({
      name: params.name,
      members: params.members,
      owner: params.owner,
    });

    return await groupInstance.save();
  }

  async findRelationalGroups(userId) {
    return await this.ctx.model.Group.find({ members: userId });
  }

  async findCreateGroups(userId) {
    return await this.ctx.model.Group.find({ owner: userId });
  }

  async findMembers(groupId) {
    return await this.ctx.model.Group.findById(groupId, { members: 1, _id: 0 });
  }
}

module.exports = GroupService;
