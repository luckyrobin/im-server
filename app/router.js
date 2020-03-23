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

};
