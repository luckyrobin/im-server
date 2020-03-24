// const Controller = require('egg').Controller;
const HttpController = require('./base/http');
const Core = require('@alicloud/pop-core');

var client = new Core({
    accessKeyId: 'LTAI4Frk7UF5C4dupvaHfopQ',
    accessKeySecret: '1FH7Bxe3lrYFmqrIXqWjM0x4VAHpXR',
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2020-05-25'
});

var params = {
    "RegionId": "cn-hangzhou",
    "PhoneNumbers": "17362987381",
    "SignName": "黑马云聊",
    "TemplateCode": "SMS_173696221"
}

var requestOption = {
    method: 'POST'
};

class LoginController extends HttpController {

    async send() {
        const { ctx } = this;
        
        client.request('SendSms', params, requestOption).then((result) => {
            console.log(JSON.stringify(result));
            this.success({
                msg: '短信发送成功'
            })
          }, (ex) => {
            console.log(ex);
          })
        
    }
}


module.exports = LoginController;
