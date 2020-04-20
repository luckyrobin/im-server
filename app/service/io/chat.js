'use strict';

const Service = require('egg').Service;

class ChatService extends Service {
  async checkAuthToken(token) {
    return true;
  }

  async checkUserInGroup(userId, groupId) {
    const { service } = this.ctx;
    const groupMembers = await service.group.findMembers(groupId);
    return groupMembers.members.includes(userId);
  }
}

module.exports = ChatService;
