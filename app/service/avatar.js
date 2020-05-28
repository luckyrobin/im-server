'use strict';

const Service = require('egg').Service;

class AvatarService extends Service {
  async findByUserId(userId) {
    return await this.ctx.model.AvatarCheck.findOne({
      user_id: userId,
    });
  }
}

module.exports = AvatarService;
