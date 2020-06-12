'use strict';
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;

  // 短信发送
  router.post('/api/sendSms', controller.signin.sendSms);

  // app登录
  router.post('/api/smsLogin', controller.signin.login);

  // 刷新 token
  router.post('/api/refreshToken', middleware.rftauth());

  // 获取二维码 device_id
  router.get('/api/qrCode', controller.signin.generateDeviceId);

  // 二维码， app确认登录
  router.post('/api/qrCodeLogin', middleware.apiauth(), controller.signin.qrLogin);

  // 测试登录态
  router.get('/api/test', middleware.apiauth(), controller.signin.test);

  // 登出
  router.post('/api/logout', controller.signin.logout);

  // 桌面端登出
  router.post('/api/logout/desktop', controller.signin.logout4Desktop);

  // 用户
  // router.post('/api/user', app.controller.user.add);

  // 通讯录管理
  router.resources('/api/address', middleware.apiauth(), app.controller.addressBook);
  // 通讯录模糊查询
  router.post('/api/address_search', middleware.apiauth(), app.controller.addressBook.search);

  // 录入 联系人
  router.resources('/api/user', app.controller.user);
  router.post('/api/user_delete', middleware.apiauth(), app.controller.user.destroy);
  router.get('/api/user_info/:id', middleware.apiauth(), app.controller.user.getUser);
  router.get('/api/user_info', middleware.apiauth(), app.controller.user.getCurrentUser);

  // 通过部门查询user
  router.post('/api/address_user', middleware.apiauth(), app.controller.user.findUser);

  // router.get('/api/user_address', app.controller.user.getAddress);

  // 备注管理
  router.post('/api/remark', middleware.apiauth(), app.controller.remark.setRemark);
  router.get('/api/remark', middleware.apiauth(), app.controller.remark.list);
  router.get('/api/remark/:id', middleware.apiauth(), app.controller.remark.findOne);

  // 系统消息
  router.resources('/api/note', middleware.apiauth(), app.controller.note);
  // 系统消息批量删除
  router.post('/api/note/delete', middleware.apiauth(), app.controller.note.delete);
  router.put('/api/note/recall/:id', middleware.apiauth(), app.controller.note.recall);

  // 公告
  router.resources('/api/notice', middleware.apiauth(), app.controller.notice);
  // 公告 批量删除
  router.post('/api/notice/delete', middleware.apiauth(), app.controller.notice.delete);
  // 公告 图片上传
  router.post('/api/notice/upload', middleware.apiauth(), app.controller.notice.upload);

  router.get('/api/test1', app.controller.addressBook.test);
  // 头像设置
  router.post('/api/avatar', middleware.apiauth(), app.controller.user.setAvatar);

  // 超管
  // 验证码校验
  router.post('/api/sms_check', app.controller.administrator.check);
  // 菜单权限
  router.post('/api/role/menu', middleware.apiauth(), app.controller.administrator.setRole);
  router.get('/api/menu', middleware.apiauth(), app.controller.administrator.getMenu);


  // 批量审批头像
  router.put('/api/avatar/check', middleware.apiauth(), app.controller.avatarCheck.update);
  router.get('/api/avatar/check', middleware.apiauth(), app.controller.avatarCheck.index);

  // group settings
  router.get('/api/group/:id', middleware.apiauth(), app.io.controller.group.show);
  router.post('/api/group', middleware.apiauth(), app.io.controller.group.create);
  router.del('/api/group/:id', middleware.apiauth(), middleware.groupfilter(), app.io.controller.group.destroy);
  router.put('/api/group/:id', middleware.apiauth(), middleware.groupfilter(), app.io.controller.group.update);
  // router.resources('/api/group', middleware.apiauth(), app.middleware.groupfilter(), app.io.controller.group);

  // timeline update
  router.put('/api/timeline/:id', middleware.apiauth(), app.io.controller.timeline.update);

  // pull history message
  router.post('/api/message', middleware.apiauth(), app.io.controller.chat.getHistoryMessage);

  router.get('*', controller.render.index);

  // chat files(images, audio) message
  router.post('/api/message/upload', middleware.apiauth(), app.io.controller.chat.upload);

  require('./router/io').gw_receive(app);
};
