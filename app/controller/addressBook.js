// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class AddressController extends HttpController {

    // parent name
    async create() {
        const { ctx, service } = this;
        const body = ctx.request.body;
        console.log(body)
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
        const res = await ctx.model.AddressBook.find({
            parent: {
                $exists: false
            }
        });

        this.success({
            data: res
        });
    }

    async search() {
        const { ctx } = this;
        console.log('xxxxxxxx')
        const body = ctx.request.body;
        
        const userRes = await ctx.model.User.find({
            name: {
                $regex: body.search
            }
        });

        const addressRes = await ctx.model.AddressBook.find({
            name: {
                $regex: body.search
            }
        });

        this.success({
            data: {
                user: userRes,
                address: addressRes
            }
        });
    }


}

module.exports = AddressController;
