var Service = require('egg').Service;

class UserService extends Service {
    async add(data) {
        // 生成部门信息
        // console.log(this._handleAddress)
        const address_str = await this._handleAddress(data.parent, this.ctx);

        const userInstance = new this.ctx.model.User({
            name: data.name,
            phone_number: data.phone_number,
            sex: data.sex,
            email: data.email,
            parent: data.parent,
            address_str
        });

        const res = await userInstance.save();
        // console.log('res', res);
        return await this.ctx.model.AddressBook.update({
            _id: data.parent
        }, {
                $push: {
                    child_user: res._id
                }
            });
    }

    async update(...data) {
        const { ctx } = this;
        const res = await ctx.model.User.update(...data);
    }

    async getUser() {
        const authorization = this.ctx.request.header.authorization;
        const result = await this.ctx.app.redis.get('105a6a3b146d');

        const userData = await this.ctx.model.User.findOne({
            phone_number: result
        });

        return userData;
    }

    async _handleAddress(id, ctx) {
        const arr = [];
        await this._findAddress(id, ctx, arr);
        return arr.reverse().join('-');
    }

    async _findAddress(id, ctx, arr) {
        // const arr = [];
        // console.log(arr)
        const res = await ctx.model.AddressBook.findOne({
            _id: id
        });
        // console.log(res);
        arr.push(res.name);
        if(res.parent) {
            // arr.push(res.name);
            await this._findAddress(res.parent, ctx, arr);
        }
        // console.log(arr);
        // return arr;
    }
}

module.exports = UserService;
