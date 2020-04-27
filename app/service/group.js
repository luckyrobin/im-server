'use strict';

const Service = require('egg').Service;

class GroupService extends Service {

  async create(params) {
    const groupDocument = new this.ctx.model.Group({
      name: params.name,
      members: params.members,
      owner: params.owner,
    });

    return await groupDocument.save();
  }

  async findRelationalGroups(userId) {
    // the slow query
    return await this.ctx.model.Group.find({ members: userId });
  }

  async findCreateGroups(userId) {
    return await this.ctx.model.Group.find({ owner: userId });
  }

  // projection to members
  async findMembers(groupId) {
    return await this.ctx.model.Group.findById(groupId, { members: 1, _id: 0 });
  }
}

module.exports = GroupService;
