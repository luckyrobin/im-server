'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  router.post('/api/login', controller.login.login);
  router.post('/api/sign_up', controller.login.sign_up);
  router.get('/api/logout', app.middleware.login(), controller.login.logout);

  // 短信发送
  router.post('/api/sendSms', controller.sms.send);

  // app登录
  router.post('/api/smsLogin', controller.sms.check);

  // 二维码， app确认登录
  router.post('/api/qrCodeLogin', controller.sms.qrLogin);

  // 获取二维码 device_id
  router.get('/api/qrCode', controller.sms.qrCode);

  // 测试登录态
  router.get('/api/test', app.middleware.login(),controller.sms.test);



  // 用户
  router.post('/api/user', app.controller.user.add);
  
};
