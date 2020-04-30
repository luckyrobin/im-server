'use strict';

const Service = require('egg').Service;

class GroupService extends Service {

  async joinMineGroup(socket, userId) {
    const { service, app } = this.ctx;

    const myGroups = await service.group.findRelationalGroups(userId);

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
    const { service, app, config, helper } = this.ctx;

    members.forEach(async userId => {
      const cooked = await service.io.client.getCooked(userId);

      app.io.of('/chat').emit(
        config.emitsheet.CHAT_GLEAVE,
        helper.parseIOMsg('CHAT_GLEAVE', { id: groupId, isDissolve: true }, 'success')
      );

      Object.keys(cooked).forEach(deviceType => {
        const socket = app.io.of('/chat').sockets[cooked[deviceType]];

        socket.leave(`${app.config.ROOMPREFIX}${groupId}`, () => {
          // TODO
        });
      });
    });
  }
}

module.exports = GroupService;
