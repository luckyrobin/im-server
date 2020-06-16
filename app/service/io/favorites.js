'use strict';

const Service = require('egg').Service;

class FavoritesService extends Service {

  async create(params) {
    const document = new this.ctx.model.Favorites({
      owner: params.owner,
      timeline: params.timeline,
      messages: params.messages,
    });
    return await document.save();
  }

  async findByOwner(owner) {
    return await this.ctx.model.Favorites.find({ owner });
  }

  async delete(id) {
    return await this.ctx.model.Favorites.findByIdAndDelete(id);
  }
}

module.exports = FavoritesService;
