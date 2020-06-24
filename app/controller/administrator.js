'use strict';
// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class AdministratorController extends HttpController {
  // phone1  phone2  code1 code2
  async check() {
    const { ctx } = this;
    const body = ctx.request.body;

    try {
      const code1 = await this.app.redis.get(body.phone1);
      const code2 = await this.app.redis.get(body.phone2);

      if (code1 === body.code1 && code2 === body.code2) {
        const userData = await this.service.user.getUser();
        const newUser = await ctx.model.User.findOne({
          phone_number: body.phone2,
        });

        await this.service.user.update(
          {
            _id: userData._id,
          },
          {
            auth: 2,
          }
        );

        const res2 = await this.service.user.update(
          {
            _id: newUser._id,
          },
          {
            auth: 1,
          }
        );
        this.success({
          data: res2,
        });
      } else {
        throw new ctx.HttpError(this.app.config.errorCode.CODE_VALID_FAILED);
      }
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  async setRole() {
    const { ctx } = this;
    const body = ctx.request.body;
    const res = await this.ctx.model.User.updateMany(
      {
        _id: {
          $in: body.user_arr,
        },
      },
      {
        menuRole: body.role_arr,
      }
    );

    this.success({
      data: res,
    });
  }

  async getMenu() {
    try {
      const userData = await this.service.user.findRoleUser();
      this.success({
        data: userData,
      });
    } catch (e) {
      this.fail({
        msg: e.message,
      });
    }
  }
}

module.exports = AdministratorController;
