'use strict';
const HttpController = require('./base/http');

class RemarkController extends HttpController {
  async create() {
    const { ctx } = this;
    const { request } = ctx;
    const { userId } = request;
    const body = ctx.request.body;

    try {
      const resp = await ctx.model.Remark.update({ master: userId, guest: body.guest }, { name: body.name }, { new: true, upsert: true });

      this.success({
        data: resp,
      });
    } catch (err) {
      this.fail({
        msg: err,
      });
    }
  }

  async index() {
    const { ctx } = this;
    const { request } = ctx;
    const { userId } = request;

    const resp = await ctx.model.Remark.find({
      master: userId,
    });

    this.success({
      data: resp,
    });
  }

  async show() {
    const { ctx } = this;
    const { params, request } = ctx;
    const { userId } = request;

    try {
      const resp = await ctx.model.Remark.findOne({
        master: userId,
        guest: params.id,
      });

      this.success({
        data: resp,
      });
    } catch (err) {
      this.fail({
        data: err,
      });
    }
  }
}

module.exports = RemarkController;
