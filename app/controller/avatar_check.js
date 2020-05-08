'use strict';
const HttpController = require('./base/http');

class AvatarCheckController extends HttpController {
  // 批量审批
  async update() {
    const { ctx } = this;
    const body = ctx.request.body;

    const res = await ctx.model.AvatarCheck.update(
      {
        user_id: body.user_arr,
      },
      {
        status: body.status,
      },
      {
        multi: true,
      }
    );

    if (body.status === 2 || body.status === 3) {
      await ctx.model.User.update(
        {
          _id: body.user_arr,
        },
        {
          $unset: {
            avatar: '',
          },
        },
        {
          multi: true,
        }
      );
    }

    this.success({
      msg: 'ok',
      data: res,
    });
  }

  async index() {
    const { ctx } = this;
    const dataLength = await this.ctx.model.AvatarCheck.find({}).count();
    // console.log(ctx.query);
    const query = ctx.query;
    // this.success({
    //   data: res,
    // });

    const count = query.count || 20;
    const page = query.page || 1;

    const res = await this.ctx.model.AvatarCheck.find({})
      .skip(count * (page - 1))
      .limit(parseInt(count));

    this.success({
      data: {
        list: res,
        count: dataLength,
      },
    });
  }

  async find() {
    const { ctx } = this;
    const body = ctx.request.body;
    try {
      const dataLength = await ctx.model.AvatarCheck.find({
        name: {
          $regex: body.search || '',
        },
      }).count();
      const count = body.count || 20;
      const page = body.page || 1;
      const res = await ctx.model.AvatarCheck.find({
        content: {
          $regex: body.search || '',
        },
      })
        .skip(count * (page - 1))
        .limit(count);
      this.success({
        data: {
          list: res,
          count: dataLength,
        },
      });
    } catch (err) {
      this.fail({
        data: err,
      });
    }
  }
}

module.exports = AvatarCheckController;
