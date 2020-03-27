'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;

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
  router.get('/api/test', app.middleware.login(), controller.sms.test);

  // 用户
  router.post('/api/user', app.controller.user.add);

  // 录入组织结构
  router.post('/api/address_book', app.controller.addressBook.add);

  // 录入 联系人
  router.post('/api/add_user', app.controller.addressBook.addUser);


  // io is equivalent to io.of('/')
  // namespace: sso
  // route is equivalent to socket.on(eventName, callback)
  // https://github.com/eggjs/egg-socket.io/blob/master/lib/socket.io/namespace.js#L19
  io.of('/sso').route('qrlogin', app.io.controllers.sso.qrlogin);

  router.get('*', controller.render.index);
};
