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

  async findByOwner(owner, params) {
    const { pageSize, current, search } = params;
    let result = await this.ctx.model.Favorites.find({ owner }).skip(pageSize * (current - 1)).limit(parseInt(pageSize));
    if (search !== '') {
      const reg = new RegExp(`\\${search}`, 'ig');
      result = result.filter(item => {
        const matched = item.messages.some(msg => {
          return reg.test(msg.content) || reg.test(msg.from.name);
        });
        return reg.test(item.timeline.alias) || matched;
      });
    }
    return result;
  }

  async delete(id) {
    return await this.ctx.model.Favorites.findByIdAndDelete(id);
  }
}

module.exports = FavoritesService;
