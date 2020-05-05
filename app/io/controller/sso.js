'use strict';

exports.qrlogin = async function() {
  const { app, helper, socket } = this;
  app.gateway.SSO_QRLOGIN(this.ctx, socket.id, helper.parseIOMsg('SSO_QRLOGIN', 'pong', 'success'));
};
