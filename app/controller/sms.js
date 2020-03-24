// const Controller = require('egg').Controller;
const HttpController = require('./base/http');
const Core = require('@alicloud/pop-core');
const requestIp = require('request-ip');

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

    async send() {
        const { ctx } = this;
        const body = ctx.request.body;

        var params = {
            "RegionId": "cn-hangzhou",
            "PhoneNumbers": body.phone_number,
            "SignName": "黑马云聊",
            "TemplateCode": "SMS_173696221",
            "TemplateParam": `{"code": ${getCode()}}`
        }

        await client.request('SendSms', params, requestOption).then((result) => {
            // console.log(JSON.stringify(result));
            this.success({
                msg: '短信发送成功'
            });
        }, (ex) => {
            this.fail({
                msg: '短信发送失败'
            });
        })
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
