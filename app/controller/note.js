'use strict';
const HttpController = require('./base/http');

// 通知（短）
class NoteController extends HttpController {
  async create() {
    const { ctx, service } = this;
    const body = ctx.request.body;
    const userId = ctx.request.userId;
    const self = this;
    try {
      const instance = new ctx.model.Note({
        content: body.content,
        creator: userId,
      });

      const res = await instance.save();
      const savemsg = { _id: res._id, content: res.content, creator: res.creator };
      const mqmsg = service.io.globalmessage.fakeNoteMsg(savemsg);

      service.io.globalmessage.task(mqmsg, savedmsg => {
        self._updateById(res._id, { message: savedmsg._id });
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
    const query = ctx.query;
    const count = query.count || 20;
    const page = query.page || 1;
    const status = Number(query.status);
    const queries = {
      content: {
        $regex: query.search || '',
      },
    };
    if (!Number.isNaN(status)) {
      queries.status = status;
    }
    const resultPromise = this.ctx.model.Note.find(queries);
    const allRes = await resultPromise;
    const dataLength = allRes.length;
    const res = await resultPromise
      .sort({ create_time: -1 })
      .skip(count * (page - 1))
      .limit(parseInt(count));

    this.success({
      data: {
        list: res,
        count: dataLength,
        timestamp: +new Date(),
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
      // const ids = await ctx.model.Note.find({ _id: { $in: body.note_arr } }, { message: 1, _id: 0 });
      const res = await ctx.model.Note.deleteMany({ _id: { $in: body.note_arr } });

      // 副作用，同时删除创建的 message
      // await ctx.service.io.message.removeStoreMessageByIds(ids.map(i => i.message));

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
    const { ctx, app, service } = this;
    const id = ctx.params.id;
    const userId = ctx.request.userId;
    try {
      const currentNote = await ctx.model.Note.findById(id);
      if (currentNote.status === 1) {
        throw new ctx.HttpError('[NOTE] current note has recalled');
      }
      if (((Date.now() - Date.parse(currentNote.create_time)) / 1000) > app.config.recallExpiresIn) {
        throw new ctx.HttpError('[NOTE] current note exceed 2min');
      }
      const resp = await ctx.model.Note.findOneAndUpdate({ _id: id }, { status: 1 }, { new: true });
      // TODO undo note
      const recalledMessage = await service.io.message.recallStoreMessageById(userId, resp.message);

      app.gateway.CHAT_MESSAGE_ALL(ctx, ctx.helper.parseIOMsg('CHAT_MESSAGE', recalledMessage, 'success'));

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

  async _updateById(id, params) {
    return await this.ctx.model.Note.update({ _id: id }, { ...params });
  }
}

module.exports = NoteController;
