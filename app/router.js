'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  router.get('/', controller.home.index);

  router.post('/api/login', controller.login.login);
  router.post('/api/sign_up', controller.login.sign_up);
  router.get('/api/logout', app.middleware.login(), controller.login.logout);

  // io is equivalent to io.of('/')
  // namespace sso
  // route is equivalent to socket.on(eventName, callback)
  // https://github.com/eggjs/egg-socket.io/blob/master/lib/socket.io/namespace.js#L19
  io.of('/sso').local.route('pg', app.io.controllers.sso.ping);
};
