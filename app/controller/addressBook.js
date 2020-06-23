'use strict';
// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class AddressController extends HttpController {
  async create() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    try {
      const hasFind = await service.address.findByParent(body);
      if (hasFind) throw new ctx.HttpError(this.app.config.errorCode.DUPLICATE_VALUE, 'address is duplicate');
      let res;
      if (body.parent) {
        res = await service.address.addChildAddress({
          parent: body.parent,
          name: body.name,
        });
      } else {
        res = await service.address.addTopAddress({
          name: body.name,
        });
      }

      this.success({
        msg: '部门创建成功',
        data: res,
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  async index() {
    const { ctx } = this;
    const res = await ctx.model.AddressBook.find({
      parent: {
        $exists: false,
      },
    });

    this.success({
      data: res,
    });
  }

  async search() {
    const { ctx } = this;
    const body = ctx.request.body;

    const userRes = await ctx.model.User.find({
      name: {
        $regex: body.search,
      },
    });

    const addressRes = await ctx.model.AddressBook.find({
      name: {
        $regex: body.search,
      },
    });

    this.success({
      data: {
        user: userRes,
        address: addressRes,
      },
    });
  }

  async update() {
    const { ctx } = this;
    const body = ctx.request.body;
    const id = ctx.params.id;
    try {
      const res = await ctx.model.AddressBook.update(
        {
          _id: id,
        },
        {
          ...body,
        }
      );

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

  async destroy() {
    const { ctx } = this;
    const id = ctx.params.id;

    const res = await ctx.model.AddressBook.findOneAndRemove({
      _id: id,
    });

    await ctx.model.User.remove({
      address_id_arr: id,
    });
    // // 在子集中删除
    // const user_arr = [];
    // const address_arr = [];

    // if(res.child_address.length) {

    // }

    // 在父级中删除
    if (res.parent) {
      await ctx.model.AddressBook.update(
        {
          _id: res.parent,
        },
        {
          $pull: {
            child_address: id,
          },
        }
      );
    }

    this.success({
      msg: '删除成功',
    });
  }
}

module.exports = AddressController;
