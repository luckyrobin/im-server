// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class RemarkController extends HttpController {

    async setRemark() {
        const { ctx } = this;
        const body = ctx.request.body;
        const userData = await this.service.user.getUser();

        try {
            const findRes = await ctx.model.Remark.find({
                master: userData._id,
                guest: body.guest,
            });

            if (findRes.lenght) {
                const res = await ctx.model.Remark.update({
                    master: userData._id,
                    guest: body.guest,
                }, {
                        name: body.name
                    });

                this.success({
                    data: res
                });
            } else {
                // 如果没有设置备注，则创建
                const instance = new ctx.model.Remark({
                    master: userData._id,
                    guest: body.guest,
                    name: body.name
                });

                const res = await instance.save();
                this.success({
                    data: res
                });
            }
        } catch (err) {
            this.fail({
                msg: err
            });
        }


    }

    async list() {
        const { ctx } = this;
        const userData = await this.service.user.getUser();

        const res = await ctx.model.Remark.find({
            master: userData._id
        });

        this.success({
            data: res
        });
    }

    async findOne() {
        const { ctx } = this;
        const userData = await this.service.user.getUser();
        const id = ctx.params.id;

        try {
            const res = await ctx.model.Remark.findOne({
                master: userData._id,
                guest: id
            });

            this.success({
                data: res
            });
        } catch (err) {
            this.fail({
                data: err
            });
        }
    }
}

module.exports = RemarkController;
