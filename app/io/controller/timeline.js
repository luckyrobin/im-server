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
    const { params, request, service, helper } = this.ctx;
    const body = request.body;

    const updatedParams = {};
    Reflect.has(body, 'top') && (updatedParams.top = body.top);
    Reflect.has(body, 'mute') && (updatedParams.mute = body.mute);
    Reflect.has(body, 'saved') && (updatedParams.saved = body.saved);

    try {
      // 如果没有创建群会话框，则自动创建一个
      if (Reflect.has(updatedParams, 'saved')) {
        const hasCreated = await service.io.timeline.findById(params.id);
        if (!hasCreated) {
          const conversation = helper.parseTimelineId(params.id);
          await service.io.timeline.createBatch({
            to: conversation.to,
            from: conversation.from,
            typeu: 2,
          });
        }
      }

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
