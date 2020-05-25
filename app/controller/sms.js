'use strict';
const HttpController = require('./base/http');
const Core = require('@alicloud/pop-core');

const client = new Core({
  accessKeyId: 'LTAI4Frk7UF5C4dupvaHfopQ',
  accessKeySecret: '1FH7Bxe3lrYFmqrIXqWjM0x4VAHpXR',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25',
});

const requestOption = {
  method: 'POST',
};

// 短信验证码生成
function getCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    const radom = Math.floor(Math.random() * 10);
    code += radom;
  }

  return code;
}

function getRandomStr() {
  return Math.random()
    .toString(36)
    .substring(2, 12)
    .substring(2, 12);
}

class LoginController extends HttpController {
  // 1. phone_number
  async send() {
    const { ctx, app } = this;
    const body = ctx.request.body;

    const code = getCode();
    console.log('验证码生成=======', code);
    const params = {
      RegionId: 'cn-hangzhou',
      PhoneNumbers: body.phone_number,
      SignName: '黑马云聊',
      TemplateCode: 'SMS_173696221',
      TemplateParam: `{"code": ${code}}`,
    };

    const res = await ctx.model.User.find({
      phone_number: body.phone_number,
    });
    // console.log(res)
    if (!res.length) {
      this.fail({
        msg: '用户不存在',
      });
      return;
    }

    await client.request('SendSms', params, requestOption).then(
      () => {
        // console.log(JSON.stringify(result));
        app.redis.set(body.phone_number, code);
        app.redis.expire(body.phone_number, 600);

        this.success({
          msg: '短信发送成功',
        });
      },
      () => {
        this.fail({
          msg: '短信发送失败',
        });
      }
    );
  }

  // 1. phone_number 2.code
  async check() {
    const { ctx, app } = this;
    const body = ctx.request.body;

    const originCode = await app.redis.get(body.phone_number);

    if (originCode === body.code) {
      const userData = await ctx.model.User.findOne({
        phone_number: body.phone_number,
      });
      const mobileToken = await ctx.jwtToken.generate({ phone: body.phone_number, uid: `${userData._id}`, dt: ctx.helper.getDeviceType(body.deviceType) || 'MOBILE' });
      this.success({
        msg: '登录成功',
        data: {
          authorization: mobileToken,
          userData,
        },
      });
    } else {
      this.fail({
        msg: '验证码错误',
      });
    }
  }

  async test() {
    this.success({
      msg: 'ok',
    });
  }

  async qrCode() {
    const { helper } = this.ctx;
    const uuid = helper.uuid(12);
    this.success({
      data: {
        device_id: uuid,
      },
    });
  }

  async qrLogin() {
    const { ctx, app } = this;
    const body = ctx.request.body;

    const device_id = body.device_id;
    const token = ctx.request.header.authorization;
    const data = ctx.jwtToken.parse(token);
    const socketId = await app.redis.get(device_id);

    if (!socketId) {
      this.fail({
        msg: '登录失败，请重试',
      });
      return;
    }

    const PCToken = await ctx.jwtToken.generate({ phone: data.phone, uid: data.uid, dt: ctx.helper.getDeviceType(body.deviceType) || 'DESKTOP' });

    // socket 通知 device_id 端登录成功,并将 token发 送过去, 之后断开 socket 连接
    app.gateway.SSO_QRLOGIN(ctx, socketId, ctx.helper.parseIOMsg('SSO_QRLOGIN', { token: PCToken }, 'success'));
    this.success({
      msg: '登录成功',
    });
  }
}

module.exports = LoginController;
