'use strict';

const Service = require('egg').Service;

class GroupService extends Service {

  async joinMineGroup(socket, userId) {
    const { app } = this.ctx;
    const myGroups = await this.findRelationalGroups(userId);
    const myGroupsArr = [];

    myGroups.forEach(item => {
      myGroupsArr.push(`${app.config.roomprefix}${item._id}`);
    });

    return new Promise(resolve => {
      socket.join(myGroupsArr, () => {
        resolve();
      });
    });
  }

  // create group and join room immediately
  async aggregationMembers(members, groupId) {
    const { app } = this.ctx;

    return Promise.all(members.map(async userId => {
      const cooked = await this.ctx.ioClient.getCooked(userId);
      return Object.keys(cooked).map(deviceType => {
        const socket = app.io.of('/chat').sockets[cooked[deviceType]];
        return new Promise(resolve => {
          socket.join(`${app.config.roomprefix}${groupId}`, () => {
            resolve();
          });
        });
      });
    }));
  }

  // leave room and broadcast to all client
  async dissolveMembers(members, groupId) {
    const { app } = this.ctx;

    return Promise.all(members.map(async userId => {
      const cooked = await this.ctx.ioClient.getCooked(userId);
      return Object.keys(cooked).map(deviceType => {
        const socket = app.io.of('/chat').sockets[cooked[deviceType]];
        return new Promise(resolve => {
          socket.leave(`${app.config.roomprefix}${groupId}`, () => {
            resolve();
          });
        });
      });
    }));
  }

  async create(params) {
    const groupDocument = new this.ctx.model.Group({
      name: params.name,
      members: params.members,
      creator: params.owner,
      owner: params.owner,
      avatar: params.avatar,
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

  async find(groupId) {
    return await this.ctx.model.Group.findById(groupId, { create_time: 0, update_time: 0, creator: 0, __v: 0 });
  }

  // projection to members
  async findMembers(groupId) {
    return await this.ctx.model.Group.findById(groupId, { members: 1, _id: 0 });
  }

  async updateOneById(params) {
    const { _id, membersUpdate, ...otherParams } = params;
    const bulkOps = [];

    if (Object.keys(otherParams).length > 0) {
      const updateMsg = {
        updateOne: {
          filter: { _id },
          update: { ...otherParams },
        },
      };
      bulkOps.push(updateMsg);
    }

    if (Array.isArray(membersUpdate)) {
      const addReg = /^\+/g;
      const removeReg = /^\-/g;
      const willAdd = [];
      const willRemove = [];
      membersUpdate.forEach(item => {
        if (addReg.test(item)) willAdd.push(item.replace(addReg, ''));
        if (removeReg.test(item)) willRemove.push(item.replace(removeReg, ''));
      });
      if (willAdd.length > 0) {
        bulkOps.push({
          updateOne: { filter: { _id }, update: { $addToSet: { members: { $each: willAdd } } } },
        });
        // 副作用 -> 为新增群成员创建 timeline
        const writeTimelines = [];
        willAdd.forEach(userId => {
          writeTimelines.push({
            from: userId,
            to: _id,
            typeu: 2,
          });
        });
        await this.ctx.service.io.timeline.createByStatic(writeTimelines);
      }
      if (willRemove.length > 0) {
        bulkOps.push({
          updateOne: { filter: { _id }, update: { $pull: { members: { $in: willRemove } } } },
        });
      }
    }

    if (Reflect.has(otherParams, 'name')) {
      this.ctx.service.io.timeline.updateAlias(_id, otherParams.name);
    }

    await this.ctx.model.Group.bulkWrite(bulkOps);
    return this.find(_id);
  }
}

module.exports = GroupService;
