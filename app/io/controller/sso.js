'use strict';

exports.qrlogin = async function() {
  const { socket, app, helper } = this;
  socket.emit(
    app.config.emitsheet.SSO_QRLOGIN,
    helper.parseIOMsg(app.config.emitsheet.SSO_QRLOGIN, 'pong', 'success')
  );
};
