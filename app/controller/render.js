const HttpController = require('./base/http');


class LoginController extends HttpController {
    async index() {
        // console.log('111111111111')
        this.app.nunjucks.cleanCache('index.html');
        console.log(this.app.nunjucks.cleanCache)
        await this.ctx.render('index.html')
    }
}


module.exports = LoginController;
