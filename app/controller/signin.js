'use strict';

const HttpController = require('./base/http');
const Core = require('@alicloud/pop-core');

const SmsClient = new Core({
  accessKeyId: 'LTAI4Frk7UF5C4dupvaHfopQ',
  accessKeySecret: '1FH7Bxe3lrYFmqrIXqWjM0x4VAHpXR',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25',
});

const randomCode = (min, max) => Math.floor(Math.random() * (max - min)) + min;

class SignInController extends HttpController {

  async sendSms() {
    const { ctx, app } = this;
    const body = ctx.request.body;

    try {
      const code = randomCode(100000, 999999);
      const params = {
        RegionId: 'cn-hangzhou',
        PhoneNumbers: body.phone_number,
        SignName: '黑马云聊',
        TemplateCode: 'SMS_173696221',
        TemplateParam: `{"code": ${code}}`,
      };

      let userData = null;
      // 如果是用户自己修改新的手机号码，则通过 token 获取 uid 拿到用户详细数据
      const token = ctx.request.header.authorization;
      if (token) {
        const verify = ctx.jwtToken.check(token);
        userData = await ctx.model.User.findOne({
          _id: verify.uid,
        });
      } else {
        userData = await ctx.model.User.findOne({
          phone_number: body.phone_number,
        });
      }

      if (!userData) throw new ctx.HttpError(app.config.errorCode.USER_NOT_EXIST);

      await SmsClient.request('SendSms', params, { method: 'POST' }).then(
        () => {
          app.redis.set(body.phone_number, code);
          app.redis.expire(body.phone_number, 600);
          this.success({
            msg: 'auth code send succeed',
          });
        },
        () => {
          throw new ctx.HttpError('auth code send failed');
        }
      );
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  async checkSms(phone, code) {
    const originCode = await this.app.redis.get(phone);
    return `${originCode}` === `${code}`;
  }

  async login() {
    const { ctx, app, logger } = this;
    const body = ctx.request.body;

    if (!body.phone_number || !body.code) throw new ctx.HttpError(app.config.errorCode.MISS_PARAMS);

    try {
      const isMatch = await this.checkSms(body.phone_number, body.code);
      if (!isMatch) throw new ctx.HttpError(app.config.errorCode.CODE_VALID_FAILED);

      const userData = await ctx.model.User.findOne({
        phone_number: body.phone_number,
      });
      if (!userData) throw new ctx.HttpError(app.config.errorCode.USER_NOT_EXIST);

      const dt = ctx.helper.getDeviceType(body.deviceType) || 'MOBILE';
      const cacheToken = await app.redis.get(`${app.config.redisTokenPrefix}[${dt}]${userData._id}`);
      if (cacheToken) {
        // TODO
        // duplicate 重复登录问题
        logger.info(`${app.config.redisTokenPrefix}[${dt}]${userData._id} duplicate login`);
      }

      const mobileToken = await ctx.jwtToken.generate({ phone: body.phone_number, uid: `${userData._id}`, dt });

      this.success({
        msg: 'login succeed',
        data: {
          authorization: mobileToken,
          userData,
        },
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  async test() {
    this.success({
      msg: 'ok',
    });
  }

  async generateDeviceId() {
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

    try {
      const data = ctx.jwtToken.parse(token);
      const socketId = await app.redis.get(device_id);

      if (!socketId) {
        throw new ctx.HttpError(app.config.errorCode.CODE_EXPIRED, 'deviceId is Expired');
      }
      const PCToken = await ctx.jwtToken.generate({ phone: data.phone, uid: data.uid, dt: ctx.helper.getDeviceType(body.deviceType) || 'DESKTOP' });
      // socket 通知 device_id 端登录成功,并将 token 发送过去, 之后断开 socket 连接
      app.gateway.SSO_QRLOGIN(ctx, socketId, ctx.helper.parseIOMsg('SSO_QRLOGIN', { token: PCToken }, 'success'));
      this.success({
        msg: 'login succeed',
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  async logout() {
    const { ctx, app } = this;
    try {
      const token = ctx.request.header.authorization;
      if (!token) throw new ctx.HttpError(app.config.errorCode.MISS_PARAMS, 'miss param `authorization`');

      const result = await ctx.jwtToken.removeToken(token);
      if (result === false) throw new ctx.HttpError('logout failed');
      let msg = 'logout succeed';
      if (result === 0) msg = 'logout duplicate';
      this.success({
        msg,
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  async logout4Desktop() {
    const { ctx, app } = this;
    try {
      const token = ctx.request.header.authorization;
      if (!token) throw new ctx.HttpError(app.config.errorCode.MISS_PARAMS, 'miss param `authorization`');
      const msg = 'logout desktop succeed';
      this.success({
        msg,
      });
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }

  async setPushDeviceId() {
    const { request, pushClient, app } = this.ctx;
    const body = request.body;
    const { userId } = request;
    try {
      const previousDeviceId = await pushClient.get(userId);
      if (previousDeviceId && (previousDeviceId !== body.pushDeviceId)) {
        this.ctx.pushError(previousDeviceId, app.config.errorCode.DUPLICATE_CLIENT, '您已经在另一台设备上登录');
      }
      await pushClient.push(userId, body.pushDeviceId);
      this.success();
    } catch (e) {
      this.fail({
        code: e.code,
        msg: e.message,
      });
    }
  }
}

module.exports = SignInController;
