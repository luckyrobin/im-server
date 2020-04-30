'use strict';
const HttpController = require('./base/http');

class LoginController extends HttpController {
  async sign_up() {
    try {
      const { ctx } = this;
      const body = ctx.request.body;
      // console.log('======================', body.username)
      const userInstance = new this.ctx.model.User({
        username: body.username,
        password: body.password,
        auth: 2,
      });

      await userInstance.save();
      this.success();
    } catch (err) {
      this.fail({
        data: err && err.message,
      });
    }
  }

  async login() {
    const { ctx } = this;
    const body = ctx.request.body;
    const userInfo = await this.ctx.model.User.findOne({
      username: body.username,
    });
    // console.log('!!!!!!!!', userInfo, userInfo.password)
    if (userInfo && userInfo.password === body.password) {
      ctx.session.user = userInfo._id;

      this.success({
        msg: '登录成功',
      });
    } else {
      // console.log('111111111111')
      this.fail({
        msg: '用户名或密码错误',
      });
    }
  }

  async logout() {
    const { ctx } = this;
    ctx.session = null;
    this.success({
      msg: '退出成功',
    });
  }
}

module.exports = LoginController;
