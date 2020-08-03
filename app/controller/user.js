'use strict';
// const Controller = require('egg').Controller;
const HttpController = require('./base/http');
// const sendToWormhole = require('stream-wormhole');
const path = require('path');

class UserController extends HttpController {
  async create() {
    const { ctx } = this;
    const body = ctx.request.body;

    try {
      const res = await this.service.user.add({
        name: body.name,
        phone_number: body.phone_number,
        sex: body.sex,
        email: body.email,
        parent: body.parent,
        job: body.job,
      });

      this.success({
        data: res,
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  async update() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    const id = ctx.params.id;

    try {
      const res = await service.user.update(
        {
          _id: id,
        },
        {
          ...body,
        }
      );

      this.success({
        msg: '修改成功',
        data: res,
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  // address_id   user_arr
  async destroy() {
    const { ctx } = this;
    const body = ctx.request.body;

    // console.log('======', body.user_arr)

    try {
      const res = await ctx.model.User.remove({
        _id: {
          $in: body.user_arr,
        },
      });

      const res2 = await ctx.model.AddressBook.update(
        {
          _id: body.address_id,
        },
        {
          $pull: {
            child_user: body.user_arr,
          },
        }
      );

      this.success({
        data: res2,
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  // count page address_id search_name
  async findUser() {
    const { ctx } = this;
    const body = ctx.request.body;

    const queryParams = {};
    Reflect.has(body, 'address_id') && (queryParams.address_id_arr = body.address_id);
    Reflect.has(body, 'search_name') && (queryParams.$or = [{ name: { $regex: body.search_name } }, { phone_number: { $regex: body.search_name } }]);

    const resultPromise = this.ctx.model.User.find(queryParams);

    const _count = await resultPromise;

    const size = body.count || 20;
    const page = body.page || 1;

    const resp = await resultPromise
      .sort({ create_time: -1 })
      .skip(size * (page - 1))
      .limit(parseInt(size));

    this.success({
      data: {
        userList: resp,
        count: _count.length,
      },
    });
  }

  async getUser() {
    // const userData = await this.service.user.getUser();
    const id = this.ctx.params.id;
    const res = await this.ctx.model.User.findOne({
      _id: id,
    });
    this.success({
      data: res,
    });
  }

  async getCurrentUser() {
    const userData = await this.service.user.getUser();
    this.success({
      data: userData,
    });
  }

  // 头像设置
  async setAvatar() {
    const { ctx, app } = this;
    const { request, HttpError } = ctx;

    try {
      const userData = await this.service.user.findUser(request.userId);
      const avatarData = await this.service.avatar.findByUserId(request.userId);
      if (avatarData && avatarData.status === 0) throw new HttpError('您上次提交的修改正在审核中');

      const stream = await this.ctx.getFileStream();
      const imgName = `avatar/${userData.name}_${new Date().getTime()}_${path.basename(stream.filename)}`;
      const result = await app.oss.instance.put(imgName, stream);

      const instance = new ctx.model.AvatarCheck({
        user_id: userData._id,
        name: userData.name,
        avatar: result.url,
        status: 0,
      });

      await instance.save();
      this.success({
        data: result.url,
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  async checkSms(phone, code) {
    const originCode = await this.app.redis.get(phone);
    return `${originCode}` === `${code}`;
  }

  async setPhone() {
    const { app, ctx, service } = this;
    const { request, HttpError } = ctx;
    const { phone_number, code } = request.body;

    if (!phone_number || !code) throw new HttpError(app.config.errorCode.MISS_PARAMS);

    try {
      const isMatch = await this.checkSms(phone_number, code);
      if (!isMatch) throw new HttpError(app.config.errorCode.CODE_VALID_FAILED);

      const resp = await service.user.update({ _id: request.userId }, { phone_number });
      this.success({
        data: resp,
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

}

module.exports = UserController;
