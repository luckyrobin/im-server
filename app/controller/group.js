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

      // create group and join room immediately
      await this.service.io.group.aggregationMembers(res.members, res._id);

      this.success({
        data: {
          _id: res._id,
        },
      });
    } catch (error) {
      this.fail({
        msg: '创建群组失败',
        data: error,
      });
    }
  }

  async destroy() {
    const { params } = this.ctx;
    try {
      const res = await this.service.group.delete(params.id);

      // leave room and broadcast to all client
      await this.service.io.group.aggregationMembers(res.members, res._id);

      this.success({
        data: {
          _id: res._id,
        },
      });
    } catch (error) {
      this.fail({
        msg: '解散群组失败',
        data: error,
      });
    }
  }

}

module.exports = GroupController;
