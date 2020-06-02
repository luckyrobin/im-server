'use strict';
const HttpController = require('./base/http');

// 通知（短）
class NoteController extends HttpController {
  async create() {
    const { ctx } = this;
    const body = ctx.request.body;

    try {
      const instance = new ctx.model.Note({
        content: body.content,
      });

      const res = await instance.save();

      this.success({
        data: res,
      });
    } catch (err) {
      this.fail({
        data: err,
      });
    }
  }

  async find() {
    const { ctx } = this;
    const body = ctx.request.body;
    try {
      const dataLength = await ctx.model.Note.find({
        content: {
          $regex: body.search || '',
        },
      }).count();
      const count = body.count || 20;
      const page = body.page || 1;
      const res = await ctx.model.Note.find({
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

  async update() {
    const { ctx } = this;
    const body = ctx.request.body;
    const id = ctx.params.id;

    try {
      const res = await ctx.model.Note.update({
        _id: id,
      }, {
        ...body,
      });

      this.success({
        data: res,
      });

    } catch (err) {
      this.fail({
        data: err,
      });
    }
  }

  async index() {
    const { ctx } = this;
    const dataLength = await this.ctx.model.Note.find({}).count();
    // console.log(ctx.query);
    const query = ctx.query;
    // this.success({
    //   data: res,
    // });

    const count = query.count || 20;
    const page = query.page || 1;

    const res = await this.ctx.model.Note.find({})
      .skip(count * (page - 1))
      .limit(parseInt(count));

    this.success({
      data: {
        list: res,
        count: dataLength,
      },
    });
  }

  async show() {
    const { ctx } = this;
    const id = ctx.params.id;

    const res = await this.ctx.model.Note.findOne({
      _id: id,
    });

    this.success({
      data: res,
    });
  }

  async delete() {
    const { ctx } = this;
    const body = ctx.request.body;

    try {
      const res = await ctx.model.Note.remove({
        _id: {
          $in: body.note_arr,
        },
      });

      this.success({
        data: res,
      });
    } catch (err) {
      this.fail({
        data: err,
      });
    }
  }

  async recall() {
    const { ctx } = this;
    const id = ctx.params.id;
    try {
      // TODO
      const res = await this.ctx.model.Note.findOne({
        _id: id,
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
}

module.exports = NoteController;
