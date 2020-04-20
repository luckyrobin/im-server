'use strict';

const HttpController = require('./base/http');

class GroupController extends HttpController {
  async create() {
    const { request } = this.ctx;
    const params = request.body;

    try {
      const res = await this.service.group.create({
        name: params.name,
        members: params.members,
        owner: params.owner,
      });
      this.success({
        data: res,
      });
    } catch (error) {
      this.fail({
        msg: '创建群组失败',
        data: error,
      });
    }
  }

}

module.exports = GroupController;
