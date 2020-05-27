'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  async add(data) {
    // 生成部门信息
    // console.log(this._handleAddress)
    const address_arr = await this._handleAddress(data.parent, this.ctx);

    const address_str = address_arr
      .map(res => {
        return res.name;
      })
      .reverse()
      .join('-');

    const address_id_arr = address_arr.map(res => {
      return res.address_id;
    });

    const userInstance = new this.ctx.model.User({
      name: data.name,
      phone_number: data.phone_number,
      sex: data.sex,
      email: data.email,
      parent: data.parent,
      job: data.job,
      address_str,
      address_id_arr,
    });

    const res = await userInstance.save();
    // console.log('res', res);
    return await this.ctx.model.AddressBook.update(
      {
        _id: data.parent,
      },
      {
        $push: {
          child_user: res._id,
        },
      }
    );
  }

  async update(...data) {
    const { ctx } = this;
    const res = await ctx.model.User.update(...data);
  }

  async getUser() {
    const token = this.ctx.request.header.authorization;
    // const result = await this.ctx.app.redis.get(authorization);
    const payload = this.ctx.jwtToken.parse(token);

    const userData = await this.ctx.model.User.findOne({
      phone_number: payload.phone,
    });

    return userData;
  }

  async findUser(id) {
    const result = await this.ctx.model.User.findOne({
      _id: id,
    });

    return result;
  }

  async findRoleUser() {
    const result = await this.ctx.model.User.find({
      menuRole: { $not: { $size: 0 } },
    });

    return result;
  }

  async _handleAddress(id, ctx) {
    const arr = [];
    await this._findAddress(id, ctx, arr);
    return arr;
  }

  async _findAddress(id, ctx, arr) {
    // const arr = [];
    // console.log(arr)
    const res = await ctx.model.AddressBook.findOne({
      _id: id,
    });

    // console.log(res);
    arr.push({
      name: res.name,
      address_id: res._id,
    });

    await this.ctx.model.User.finda;
    if (res.parent) {
      // arr.push(res.name);
      await this._findAddress(res.parent, ctx, arr);
    }
    // console.log(arr);
    // return arr;
  }
}

module.exports = UserService;
