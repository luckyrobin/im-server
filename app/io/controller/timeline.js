'use strict';

const HttpController = require('../../controller/base/http');

class TimelineController extends HttpController {

  async update() {
    const { params, request } = this.ctx;
    const body = request.body;

    const updatedParams = {};
    Reflect.has(body, 'top') && (updatedParams.top = body.top);
    Reflect.has(body, 'mute') && (updatedParams.mute = body.mute);

    try {
      await this.service.io.timeline.updateOneById({
        ...{ _id: params.id },
        ...updatedParams,
      });
      this.success({
        data: {},
      });
    } catch (error) {
      this.fail({
        msg: '修改状态失败',
        data: error,
      });
    }
  }
}

module.exports = TimelineController;
