var Service = require('egg').Service;

class AddressService extends Service {
    async addTopAddress(data) {
        const modelInstance = new this.ctx.model.AddressBook({
            name: data.name
        });

        return await modelInstance.save();
    }

    async addChildAddress(data) {
        const modelInstance = new this.ctx.model.AddressBook({
            name: data.name,
            parent: data.parent
        });

        const res = await modelInstance.save();
        return await this.ctx.model.AddressBook.update({
            _id: data.parent,
        }, {
                $push: {
                    child_address: res._id
                }
            });
    }
}

module.exports = AddressService;
