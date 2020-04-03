var Service = require('egg').Service;

class UserService extends Service {
    async add(data) {
        const userInstance = new this.ctx.model.User({
            name: data.name,
            phone_number: data.phone_number,
            sex: data.sex,
            email: data.email
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
}

module.exports = UserService;
