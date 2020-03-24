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

var code_num = 123456;

var params = {
    "RegionId": "cn-hangzhou",
    "PhoneNumbers": "17362987381",
    "SignName": "黑马云聊",
    "TemplateCode": "SMS_173696221",
    "TemplateParam": `{"code": ${code_num}}`
}

var requestOption = {
    method: 'POST'
};

class LoginController extends HttpController {

    async send() {
        const { ctx } = this;
        
        await client.request('SendSms', params, requestOption).then((result) => {
            console.log(JSON.stringify(result));
            this.success({
                msg: '短信发送成功'
            })
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
        const clientIp = requestIp.getClientIp(req);
        console.log(clientIp)
        // get
        ctx.body = await app.redis.get('foo');
    }
}


module.exports = LoginController;
