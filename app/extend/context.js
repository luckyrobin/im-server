'use strict';

const JwtToken = require('./mount/jwttoken');
const IOClient = require('./mount/ioclient');
const HttpError = require('./mount/httperror');
const PushClient = require('./mount/pushclient');

let jwtTokenInstance = null;
let ioClientInstance = null;
let pushClientInstance = null;

module.exports = {
  get jwtToken() {
    if (!jwtTokenInstance) {
      jwtTokenInstance = new JwtToken(this);
    }
    return jwtTokenInstance;
  },
  get ioClient() {
    if (!ioClientInstance) {
      ioClientInstance = new IOClient(this);
    }
    return ioClientInstance;
  },
  get pushClient() {
    if (!pushClientInstance) {
      pushClientInstance = new PushClient(this);
    }
    return pushClientInstance;
  },
  HttpError,
  emitError(socket, status, msg) {
    const { app, logger, helper } = this;
    const message = msg || status.msg;
    logger.debug(
      `[IMERROR] socketId: ${socket.id} code: ${status.code} msg: ${message}`
    );
    app.gateway.IMERROR(this, socket, helper.parseIOMsg('IMERROR', null, status.code, { msg: message }));
  },
  pushError(deviceId, status, msg) {
    const { app, logger } = this;
    const title = '通知';
    const message = msg || status.msg;
    logger.debug(
      `[PUSHERROR] deviceId: ${deviceId} code: ${status.code} msg: ${message}`
    );
    app.pushService.pushNotice(deviceId, title, message, JSON.stringify(status));
  },
  getSocketById(nsp, socketId) {
    return this.app.io.of(nsp).sockets[socketId];
  },
  lazyCloseSocket(socket) {
    setTimeout(() => {
      if (socket && socket.connected) {
        socket.disconnect(true);
      }
    }, 0);
  },
};
