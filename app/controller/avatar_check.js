'use strict';
const HttpController = require('./base/http');

class AvatarCheckController extends HttpController {
  // 批量审批
  async update() {
    const { ctx } = this;
    const body = ctx.request.body;

    const resp = await ctx.model.AvatarCheck.update(
      {
        _id: body.check_arr,
      },
      {
        status: body.status,
      },
      {
        multi: true,
      }
    );

    // 审核通过
    if (body.status === 1) {
      const result = await ctx.model.AvatarCheck.find(
        {
          _id: body.check_arr,
        }
      );
      result.forEach(item => {
        this.service.user.update(
          {
            _id: item.user_id,
          },
          {
            avatar: item.avatar,
          }
        );
      });
    }

    this.success({
      msg: 'ok',
      data: resp,
    });
  }

  async index() {
    const { ctx } = this;
    const query = ctx.query;

    const page = query.page || 1;
    const count = query.count || 20;
    const status = Number(query.status);
    const queries = {
      name: {
        $regex: query.search || '',
      },
    };
    if (!Number.isNaN(status)) {
      queries.status = status;
    }
    try {
      const resultPromise = this.ctx.model.AvatarCheck.find(queries);
      const allRes = await resultPromise;
      const dataLength = allRes.length;
      const res = await resultPromise
        .skip(count * (page - 1))
        .limit(parseInt(count));

      this.success({
        data: {
          list: res,
          count: dataLength,
        },
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }
}

module.exports = AvatarCheckController;
