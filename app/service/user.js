var Service = require('egg').Service;

class UserService extends Service {
    async getUserId() {
        const egg_session = this.ctx.cookies.get('EGG_SESS', {
            signed: false
        });
        if (egg_session) {
            const result = await this.ctx.model.SessionUser.findOne({
                sessionId: egg_session
            });
            return result && result.user;
        }
        // return 
    }
}

module.exports = UserService;
