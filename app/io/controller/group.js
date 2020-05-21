'use strict';

const HttpController = require('../../controller/base/http');

class GroupController extends HttpController {
  async create() {
    const { request, app, helper } = this.ctx;
    const body = request.body;
    const { userId } = request;

    try {
      const res = await this.service.io.group.create({
        name: body.name,
        members: body.members,
        owner: body.owner,
        avatar: body.avatar,
      });

      // create group and join room immediately
      await this.service.io.group.aggregationMembers(res.members, res._id);

      app.gateway.CHAT_GROUP_NOTICE(
        this.ctx,
        `${app.config.roomprefix}${res._id}`,
        helper.parseIOMsg('CHAT_GROUP_NOTICE', { type: 'create', whoami: userId, groupId: res._id, result: res }, 'success')
      );

      this.success({
        data: res,
      });
    } catch (e) {
      this.fail({
        msg: e.message || '创建群组失败',
      });
    }
  }

  async destroy() {
    const { params, app, helper, request } = this.ctx;
    const { userId } = request;

    try {
      const res = await this.service.io.group.delete(params.id);

      app.gateway.CHAT_GROUP_NOTICE(
        this.ctx,
        `${app.config.roomprefix}${res._id}`,
        helper.parseIOMsg('CHAT_GROUP_NOTICE', { type: 'destroy', whoami: userId, groupId: res._id }, 'success')
      );

      // leave room and broadcast to all client
      await this.service.io.group.dissolveMembers(res.members, res._id);

      this.success({
        data: {
          _id: res._id,
        },
      });
    } catch (e) {
      this.fail({
        msg: e.message || '解散群组失败',
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
    } catch (e) {
      this.fail({
        msg: e.message || '查询群组信息失败',
      });
    }
  }

  async update() {
    const { params, request, app, helper, service } = this.ctx;
    const body = request.body;
    const { userId } = request;

    const updatedParams = {};
    Reflect.has(body, 'name') && (updatedParams.name = body.name);
    Reflect.has(body, 'notice') && (updatedParams.notice = body.notice);
    Reflect.has(body, 'owner') && (updatedParams.owner = body.owner);
    Reflect.has(body, 'onlyOwner') && (updatedParams.onlyOwner = body.onlyOwner);
    Reflect.has(body, 'membersUpdate') && (updatedParams.membersUpdate = body.membersUpdate);

    try {
      const res = await service.io.group.updateOneById({
        ...{ _id: params.id },
        ...updatedParams,
      });

      if (Reflect.has(updatedParams, 'membersUpdate')) {
        await this._handleMemberUpdate(updatedParams.membersUpdate, res._id);
      }

      app.gateway.CHAT_GROUP_NOTICE(
        this.ctx,
        `${app.config.roomprefix}${res._id}`,
        helper.parseIOMsg('CHAT_GROUP_NOTICE', { type: 'update', whoami: userId, groupId: res._id, updateResult: updatedParams }, 'success')
      );

      this.success({
        data: res,
      });
    } catch (e) {
      this.fail({
        msg: e.message || '更新群组信息失败',
      });
    }
  }

  async _handleMemberUpdate(membersUpdate, groupId) {
    const addReg = /^\+/g;
    const removeReg = /^\-/g;
    return Promise.all(membersUpdate.map(async member => {
      // 拉进群
      if (addReg.test(member)) {
        return await this.ctx.service.io.group.aggregationMembers([ member.replace(addReg, '') ], groupId);
      }
      // 踢出群
      if (removeReg.test(member)) {
        return await this.ctx.service.io.group.dissolveMembers([ member.replace(removeReg, '') ], groupId);
      }
    }));
  }
}

module.exports = GroupController;
