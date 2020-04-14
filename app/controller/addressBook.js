// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class AddressController extends HttpController {

    // parent name
    async create() {
        const { ctx, service } = this;
        const body = ctx.request.body;
        // console.log(body)
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
            console.log(err);
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
        // console.log('xxxxxxxx')
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

    async update() {
        const { ctx, service } = this;
        const body = ctx.request.body;
        const id = ctx.params.id;
        console.log('-----------')
        try {

            const res = await ctx.model.AddressBook.update({
                _id: id
            }, {
                ...body
            });

            this.success({
                data: res
            });

        } catch(err) {
            this.fail({
                data: err
            });
        }
    }

    async destroy() {
        const { ctx } = this;
        const id = ctx.params.id;

        const res = await ctx.model.AddressBook.findOneAndRemove({
            _id: id
        });

        const del_user_res = await ctx.model.User.remove({
            address_id_arr: id
        });
        // // 在子集中删除
        // const user_arr = [];
        // const address_arr = [];

        // if(res.child_address.length) {
            
        // }
        
        // 在父级中删除
        if(res.parent) {
            const res2 = await ctx.model.AddressBook.update({
                _id: res.parent
            }, {
                $pull: {
                    child_address: id
                }
            });
        }

        this.success({
            msg: '删除成功'
        });
    }
//Copy from NoSQLBooster for MongoDB free edition. This message does not appear if you are using a registered version.
//Copy from NoSQLBooster for MongoDB free edition. This message does not appear if you are using a registered version.



    async test() {
        const res = await this.ctx.model.AddressBook.find({
            _id: '5e8c4aae9026ca0cca4336aa'
        });

        this.success({
            data: res
        });
    }

}

module.exports = AddressController;
