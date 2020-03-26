// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class AddressController extends HttpController {

    async add() {
        const { ctx } = this;
        const body = ctx.request.body;

        const modelInstance = new ctx.model.addressBook({
            name: body.name,
        });

        try {
            const res = await modelInstance.save();
            this.success({
                msg: '添加成功'
            });
        } catch(err) {
            this.fail({
                msg: '添加失败'
            });
            console.log(err)
        }
    }

}

module.exports = AddressController;
