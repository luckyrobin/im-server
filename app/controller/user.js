'use strict';
// const Controller = require('egg').Controller;
const HttpController = require('./base/http');
// const sendToWormhole = require('stream-wormhole');
const path = require('path');

class UserController extends HttpController {
  async create() {
    const { ctx } = this;
    const body = ctx.request.body;
    const { name, phone_number, sex, email, parent, job } = body;
    if (!name) {
      this.fail({
        code: 1,
        msg: '请填写姓名',
      });
      return;
    }
    if (!sex) {
      this.fail({
        code: 1,
        msg: '请填写性别',
      });
      return;
    }
    if (!parent) {
      this.fail({
        code: 1,
        msg: '请填写部门',
      });
      return;
    }
    if (!job) {
      this.fail({
        code: 1,
        msg: '请填写职位',
      });
      return;
    }
    if (!phone_number) {
      this.fail({
        code: 1,
        msg: '请填写手机号',
      });
      return;
    } else if (await ctx.model.User.findOne({ phone_number })) {
      this.fail({
        code: 1,
        msg: '手机号已存在',
      });
      return;
    }
    if (!email) {
      this.fail({
        code: 1,
        msg: '请填写邮箱',
      });
      return;
    } else if (await ctx.model.User.findOne({ email })) {
      this.fail({
        code: 1,
        msg: '邮箱已存在',
      });
      return;
    }
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
    } catch (err) {
      this.fail({
        msg: '添加失败',
        data: err,
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

      // console.log('======',  res)

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
    } catch (err) {
      this.fail({
        data: err,
      });
    }
  }

  // count page address_id search_name
  async findUser() {
    const { ctx } = this;
    const body = ctx.request.body;

    const queryParams = {};
    Reflect.has(body, 'address_id') && (queryParams.address_id_arr = body.address_id);
    Reflect.has(body, 'search_name') && (queryParams.name = { $regex: body.search_name || '' });

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
      this.service.user.update(
        {
          _id: userData._id,
        },
        {
          avatar: result.url,
        }
      );

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

  async getAddress() {
    // const authorization = this.ctx.request.header.authorization;
    // const result = await this.ctx.app.redis.get('105a6a3b146d');

    const { ctx } = this;
    const body = ctx.request.body;

    // const userRes = ctx.model.User.find({
    //     _id: body.user_id
    // });

    const addrssArr = await this._handleAddress(
      '5e8c4aae9026ca0cca4336aa',
      ctx
    );

    this.success({
      data: addrssArr.reverse().join('-'),
    });
  }

}

module.exports = UserController;
