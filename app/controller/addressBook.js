// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class AddressController extends HttpController {

    // parent name
    async create() {
        const { ctx, service } = this;
        const body = ctx.request.body;

        try{
            let res;
            if(body.parent) {
                res = await service.address.addChildAddress({
                    parent: body.parent,
                    name: body.name
                });
            } else {
                res = await service.address.addTopAddress({
                    name: body.name
                });
            }

            this.success({
                msg: '部门创建成功',
                data: res,
            });
        } catch(err) {
            this.fail({
                data: err
            });
        }
    }

    async index() {
        const { ctx } = this;
        console.log('xxxxxxxx')
        const res = await ctx.model.AddressBook.findOne({
            name: '武汉'
        });

        this.success({
            data: res
        });
    }
}

module.exports = AddressController;
