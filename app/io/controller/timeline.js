'use strict';

const HttpController = require('../../controller/base/http');

class TimelineController extends HttpController {

  async index() {
    const { request } = this.ctx;
    const { userId } = request;

    try {
      const resp = await this.service.io.timeline.findOwnerSavedConversations(userId);
      this.success({
        data: resp,
      });
    } catch (error) {
      this.fail({
        msg: 'get timeline failed',
      });
    }
  }

  async update() {
    const { params, request } = this.ctx;
    const body = request.body;

    const updatedParams = {};
    Reflect.has(body, 'top') && (updatedParams.top = body.top);
    Reflect.has(body, 'mute') && (updatedParams.mute = body.mute);
    Reflect.has(body, 'saved') && (updatedParams.saved = body.saved);

    try {
      const resp = await this.service.io.timeline.updateOneById({
        ...{ _id: params.id },
        ...updatedParams,
      });
      this.success({
        data: resp,
      });
    } catch (error) {
      this.fail({
        msg: 'update timeline failed',
      });
    }
  }
}

module.exports = TimelineController;
