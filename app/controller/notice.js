'use strict';

const HttpController = require('./base/http');
const path = require('path');


// 通知（公告）
class NoticeController extends HttpController {
  async create() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    const userId = ctx.request.userId;

    try {
      const instance = new ctx.model.Notice({
        content: body.content,
        image: body.image,
        abstract: body.abstract,
        title: body.title,
        creator: userId,
      });
      const res = await instance.save();
      const savemsg = {
        _id: res._id,
        content: res.content,
        image: res.image,
        abstract: res.abstract,
        title: res.title,
        creator: res.creator,
      };
      const mqmsg = service.io.globalmessage.fakeNoticeMsg(savemsg);

      service.io.globalmessage.task(mqmsg);

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
    const { ctx } = this;
    const body = ctx.request.body;
    const id = ctx.params.id;

    try {
      const res = await ctx.model.Notice.update({
        _id: id,
      }, {
        ...body,
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

  async show() {
    const { ctx } = this;
    const id = ctx.params.id;
    try {
      const res = await this.ctx.model.Notice.findOne({
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

  async delete() {
    const { ctx } = this;
    const body = ctx.request.body;

    try {
      const res = await ctx.model.Notice.remove({
        _id: {
          $in: body.notice_arr,
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

  async index() {
    const { ctx } = this;
    const query = ctx.query;

    const page = query.page || 1;
    const count = query.count || 20;

    const dataLength = await this.ctx.model.Notice.find({
      title: {
        $regex: query.search || '',
      },
    }).count();

    const res = await this.ctx.model.Notice.find({
      title: {
        $regex: query.search || '',
      },
    })
      .skip(count * (page - 1))
      .limit(parseInt(count));

    this.success({
      data: {
        list: res,
        count: dataLength,
      },
    });
  }

  async upload() {
    const { ctx, app } = this;
    try {
      const stream = await ctx.getFileStream();
      const imgName = `notice/${new Date().getTime()}_${path.basename(stream.filename)}`;
      const result = await app.oss.instance.put(imgName, stream);
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
}

module.exports = NoticeController;
