'use strict';

const Service = require('egg').Service;

class GroupService extends Service {

  async joinMineGroup(socket, userId) {
    const { app } = this.ctx;

    const myGroups = await this.findRelationalGroups(userId);

    myGroups.forEach(item => {
      socket.join(`${app.config.ROOMPREFIX}${item._id}`, () => {
        // TODO
      });
    });
  }

  // create group and join room immediately
  async aggregationMembers(members, groupId) {
    const { service, app } = this.ctx;

    members.forEach(async userId => {
      const cooked = await service.io.client.getCooked(userId);

      Object.keys(cooked).forEach(deviceType => {
        const socket = app.io.of('/chat').sockets[cooked[deviceType]];

        socket.join(`${app.config.ROOMPREFIX}${groupId}`, () => {
          // TODO
        });
      });
    });
  }

  // leave room and broadcast to all client
  async dissolveMembers(members, groupId) {
    const { service, app, helper } = this.ctx;

    members.forEach(async userId => {
      const cooked = await service.io.client.getCooked(userId);

      app.gateway.CHAT_GLEAVE(this.ctx, helper.parseIOMsg('CHAT_GLEAVE', { id: groupId, isDissolve: true }, 'success'));

      Object.keys(cooked).forEach(deviceType => {
        const socket = app.io.of('/chat').sockets[cooked[deviceType]];

        socket.leave(`${app.config.ROOMPREFIX}${groupId}`, () => {
          // TODO
        });
      });
    });
  }

  async create(params) {
    const groupDocument = new this.ctx.model.Group({
      name: params.name,
      members: params.members,
      owner: params.owner,
    });

    return await groupDocument.save();
  }

  async delete(id) {
    return await this.ctx.model.Group.findByIdAndDelete(id);
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
