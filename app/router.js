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
  // router.post('/api/user', app.controller.user.add);

  // 通讯录管理
  router.resources('/api/address', app.controller.addressBook);
  // 通讯录模糊查询
  router.post('/api/address_search', app.controller.addressBook.search);

  // 录入 联系人
  router.resources('/api/user', app.controller.user);
  router.post('/api/user_delete', app.controller.user.destroy);
  router.get('/api/user_info/:id', app.controller.user.getUser);

  // 通过部门查询user
  router.post('/api/address_user', app.controller.user.findUser);
  // 
  // router.get('/api/user_address', app.controller.user.getAddress);

  // 备注管理
  router.post('/api/remark', app.controller.remark.setRemark);
  router.get('/api/remark', app.controller.remark.list);
  router.get('/api/remark/:id', app.controller.remark.findOne);

  // 系统消息
  router.resources('/api/note', app.controller.note);
  // 系统消息批量删除
  router.post('/api/note/delete', app.controller.note.delete);

  // 公告
  router.resources('/api/notice', app.controller.notice);
    // 公告 批量删除
  router.post('/api/notice/delete', app.controller.notice.delete);
    // 公告 图片上传
  router.post('/api/notice/upload', app.controller.notice.upload);

  router.get('/api/test1', app.controller.addressBook.test);
  // 头像设置
  router.post('/api/avatar', app.controller.user.setAvatar);
  // router.get('/api/avatar', app.controller.user.getAvatar);
  // group settings
  router.post('/api/group', app.controller.group.create);

  // 超管
  // 验证码校验
  router.post('/api/sms_check', app.controller.auth.check);
  // 菜单权限
  router.post('/api/role/menu', app.controller.auth.setRole);
  router.get('/api/menu', app.controller.auth.getMenu);
  
  // router.get('/api/img', app.controller.notice.test);

   // 批量审批头像
  router.resources('/api/avatar/check', app.controller.avatarCheck);

  // route is equivalent to socket.on(eventName, callback)
  // https://github.com/eggjs/egg-socket.io/blob/master/lib/socket.io/namespace.js#L19
  io.of('/sso').route(app.config.emitsheet.SSO_QRLOGIN, app.io.controller.sso.qrlogin);
  // chat
  io.of('/chat').route(app.config.emitsheet.CHAT_TO, app.io.controller.chat.to);


  router.get('*', controller.render.index);
};
