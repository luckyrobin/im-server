'use strict';

const HttpController = require('../../controller/base/http');

class FavoritesController extends HttpController {

  async create() {
    const { request } = this.ctx;
    const body = request.body;
    const { userId } = request;

    try {
      const resp = await this.service.io.favorites.create({
        owner: userId,
        timeline: body.timelineId,
        messages: body.messages,
      });
      this.success({
        data: resp,
      });
    } catch (error) {
      this.fail({
        msg: 'add to Favorites failed',
      });
    }
  }

  async index() {
    const { request } = this.ctx;
    const { userId, query } = request;
    const indexParams = {
      pageSize: query.pageSize || 100,
      current: query.current || 1,
    };
    try {
      const resp = await this.service.io.favorites.findByOwner(userId, indexParams);
      this.success({
        data: resp,
      });
    } catch (error) {
      this.fail({
        msg: 'get Favorites failed',
      });
    }
  }

  async destroy() {
    const { params } = this.ctx;

    try {
      const resp = await this.service.io.favorites.delete(params.id);
      this.success({
        data: {
          _id: resp._id,
        },
      });
    } catch (e) {
      this.fail({
        msg: e.message || 'delete Favorites failed',
      });
    }
  }
}

module.exports = FavoritesController;
