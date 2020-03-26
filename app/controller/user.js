// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class UserController extends HttpController {

    async add() {
        const { ctx } = this;
        const body = ctx.request.body;

        const userInstance = new ctx.model.User({
            name: body.name,
            phone_number: body.phone_number
        });

        try {
            const res = await userInstance.save();
            this.success({
                msg: '添加用户成功'
            });
        } catch(err) {
            this.fail({
                msg: '添加失败'
            });
            console.log(err)
        }
    }

}


module.exports = UserController;
