// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class AddressController extends HttpController {

    async add() {
        const { ctx } = this;
        const body = ctx.request.body;

        const modelInstance = new ctx.model.AddressBook({
            name: body.name,
        });
//Copy from NoSQLBooster for MongoDB free edition. This message does not appear if you are using a registered version.

        try {
            if (body.parent) {
                const res = await modelInstance.save();
                await ctx.model.AddressBook.update({
                    _id: body.parent,
                }, {
                        $push: {
                            child_address: res._id
                        }
                    });

                this.success({
                    msg: '子级部门添加成功',
                    data: res
                });

            } else {
                const res = await modelInstance.save();
                this.success({
                    msg: '顶级部门添加成功',
                    data: res
                });
            }
        } catch (err) {
            this.fail({
                msg: '添加失败'
            });
            console.log(err)
        }
    }
//Copy from NoSQLBooster for MongoDB free edition. This message does not appear if you are using a registered version.

    async addUser() {
        const { ctx } = this;
        const body = ctx.request.body;

        try {
            const userInstance = new ctx.model.User({
                name: body.name,
                phone_number: body.phone_number,
                sex: body.sex,
                email: body.email
            });

            const res = await userInstance.save();
            // console.log('res', res);
            await ctx.model.AddressBook.update({
                _id: body.parent
            }, {
                $push: {
                    child_user: res._id
                }
            });

            this.success();
        } catch (err) {
            console.log(err);
            this.fail()
        }
    }
//Copy from NoSQLBooster for MongoDB free edition. This message does not appear if you are using a registered version.

    async getAddress() {
        const { ctx } = this;
        // console.log('======================',ctx.model.AddressBook.find)
        const res = await ctx.model.AddressBook.findOne({
            _id: '5e84a7bc6cc3d42f120c0147'
        });

        this.success({
            data: res
        })
    }
}

module.exports = AddressController;
