'use strict';
const HttpController = require('./base/http');

class LoginController extends HttpController {
  async index() {
    this.app.nunjucks.cleanCache('index.html');
    await this.ctx.render('index.html');
  }
}

module.exports = LoginController;
