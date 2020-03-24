// const Controller = require('egg').Controller;
const HttpController = require('./base/http');
const Core = require('@alicloud/pop-core');
const crypto = require('crypto');



var client = new Core({
    accessKeyId: 'LTAI4Frk7UF5C4dupvaHfopQ',
    accessKeySecret: '1FH7Bxe3lrYFmqrIXqWjM0x4VAHpXR',
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
});

var requestOption = {
    method: 'POST'
};

// 短信验证码生成
function getCode() {
    var code = "";
    for (var i = 0; i < 6; i++) {
        var radom = Math.floor(Math.random() * 10);
        code += radom;
    }

    return code;
}

class LoginController extends HttpController {

    // 1. phone_number
    async send() {
        const { ctx, app } = this;
        const body = ctx.request.body;

        const code = getCode();

        var params = {
            "RegionId": "cn-hangzhou",
            "PhoneNumbers": body.phone_number,
            "SignName": "黑马云聊",
            "TemplateCode": "SMS_173696221",
            "TemplateParam": `{"code": ${code}}`
        }

        await client.request('SendSms', params, requestOption).then((result) => {
            // console.log(JSON.stringify(result));
            
            app.redis.set(body.phone_number, code);
            app.redis.expire(body.phone_number, 60);

            this.success({
                msg: '短信发送成功'
            });
        }, (ex) => {
            this.fail({
                msg: '短信发送失败'
            });
        })
    }

    // 1. phone_number 2.code
    async check() {
        const { ctx, app } = this;
        const body = ctx.request.body;

        const originCode = await app.redis.get(body.phone_number);
        ctx.session.phone_number = body.phone_number;
        if (originCode === body.code) {
            // 写入session
            
            const secret = 'abcdefg';
            const hash = crypto.createHmac('sha256', secret)
                   .update(body.phone_number)
                   .digest('hex');

            const token = hash.substring(0, 10);

            await app.redis.set(token, body.phone_number);
            await app.expire(token, 60 * 24);

            this.success({
                msg: '登录成功'
            });
        } else {
            this.fail({
                msg: '验证码错误'
            });
        }
    }

    async test() {
        const { ctx, app } = this;
        // set
        await app.redis.set('foo', 'bar');

        // get
        ctx.body = await app.redis.get('foo');
    }
}

module.exports = LoginController;
