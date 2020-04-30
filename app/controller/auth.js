
// const Controller = require('egg').Controller;
const HttpController = require('./base/http');

class AuthController extends HttpController {

    // phone1  phone2  code1 code2  
    async check() {
        const { ctx } = this;
        const body = ctx.request.body;

        const code1 = await this.app.redis.get(body.phone1);
        const code2 = await this.app.redis.get(body.phone2);
    
        if(code1 === body.code1 && code2 === body.code2) {
            const userData = await this.service.user.getUser();
            const newUser = await ctx.model.User.findOne({
                phone_number: body.phone2
            });

            const res1 = await this.service.user.update({
                _id: userData._id
            }, {
                auth: 2
            });

            const res2 = await this.service.user.update({
                _id: newUser._id
            }, {
                auth: 1
            });

            this.success({
                data: res2
            });
        } else {
            this.fail({
                msg: '验证码错误'
            });
        }
    }

    async setRole() {
        const { ctx } = this;
        const body = ctx.request.body;
        
        const res = await this.service.user.update({
            _id: body.user_id
        }, {
            menuRole: body.role_arr
        });
        
        this.success({
            data: res
        });
    }

    async getMenu() {
        const { ctx } = this;
        const userData = await this.service.user.getUser();

        this.success({
            data: userData.menuRole
        });
    }
}


module.exports = AuthController;
