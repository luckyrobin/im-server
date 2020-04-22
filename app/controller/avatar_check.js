
// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class AvatarCheckController extends HttpController {

    // 批量审批
    async update() {
        const { ctx } = this;
        const body = ctx.request.body;

        const res = await ctx.model.AvatarCheck.update({
            user_id: body.user_arr
        }, {
            status: body.status
        }, {
            multi: true
        });

        if(body.status === 2 || body.status === 3) {
            await ctx.model.User.update({
                _id: body.user_arr
            }, {
                $unset: {
                    avatar: ""
                }
            }, {
                multi: true
            });
        }

        this.success({
            msg: 'ok',
            data: res
        });
    }

    async index() {
        const { ctx } = this;
        const res = await ctx.model.AvatarCheck.find({
        });

        this.success({
            data: res
        });
    }
}


module.exports = AvatarCheckController;
