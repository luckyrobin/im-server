'use strict';

const Service = require('egg').Service;

class GroupService extends Service {

  async joinGroup(socket, userId) {
    const { service, app } = this.ctx;

    const myGroups = await service.group.findRelationalGroups(userId);

    myGroups.forEach(item => {
      socket.join(`${app.config.ROOMPREFIX}${item._id}`, () => {
        // TODO
      });
    });
  }
}

module.exports = GroupService;
