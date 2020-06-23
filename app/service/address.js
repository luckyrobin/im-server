'use strict';

const Service = require('egg').Service;

class AddressService extends Service {
  async addTopAddress(data) {
    const modelInstance = new this.ctx.model.AddressBook({
      name: data.name,
    });

    return await modelInstance.save();
  }

  async addChildAddress(data) {
    const modelInstance = new this.ctx.model.AddressBook({
      name: data.name,
      parent: data.parent,
    });

    const resp = await modelInstance.save();
    await this.ctx.model.AddressBook.update(
      {
        _id: data.parent,
      },
      {
        $push: {
          child_address: resp._id,
        },
      }
    );
    return resp;
  }

  async findByParent(params) {
    let result = null;
    if (params.parent) {
      result = await this.ctx.model.AddressBook.findOne({
        name: params.name,
        parent: params.parent,
      });
    } else {
      result = await this.ctx.model.AddressBook.findOne({
        name: params.name,
        parent: { $exists: false },
      });
    }
    return result;
  }
}

module.exports = AddressService;
