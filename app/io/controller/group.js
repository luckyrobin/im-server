'use strict';

const HttpController = require('../../controller/base/http');

class GroupController extends HttpController {
  async create() {
    const { request } = this.ctx;
    const body = request.body;

    try {
      const res = await this.service.io.group.create({
        name: body.name,
        members: body.members,
        owner: body.owner,
        avatar: body.avatar,
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
      const res = await this.service.io.group.delete(params.id);

      // leave room and broadcast to all client
      await this.service.io.group.dissolveMembers(res.members, res._id);

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

  async show() {
    const { params } = this.ctx;
    try {
      const res = await this.service.io.group.find(params.id);
      this.success({
        data: res,
      });
    } catch (error) {
      this.fail({
        msg: '查询群组信息失败',
        data: error,
      });
    }
  }

  async update() {
    const { params, request, groupInfo } = this.ctx;
    const body = request.body;
    const { userId } = request;

    const updatedParams = {};
    Reflect.has(body, 'name') && (updatedParams.name = body.name);
    Reflect.has(body, 'notice') && (updatedParams.notice = body.notice);
    Reflect.has(body, 'owner') && (updatedParams.owner = body.owner);
    Reflect.has(body, 'onlyOwner') && (updatedParams.onlyOwner = body.onlyOwner);
    Reflect.has(body, 'membersUpdate') && (updatedParams.membersUpdate = body.membersUpdate);

    if (Reflect.has(updatedParams, 'owner')) {
      if (userId !== `${groupInfo.owner}`) {
        this.fail({
          msg: `[GROUP] current user ${userId} is not the owner of group`,
          data: {},
        });
        return;
      }
    }

    try {
      const res = await this.service.io.group.updateOneById({
        ...{ _id: params.id },
        ...updatedParams,
      });
      this.success({
        data: res,
      });
    } catch (error) {
      this.fail({
        msg: '更新群组信息失败',
        data: error,
      });
    }
  }
}

module.exports = GroupController;
