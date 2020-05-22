'use strict';

const JwtToken = require('./mount/jwttoken');
const IOClient = require('./mount/ioclient');
const HttpError = require('./mount/httperror');

let jwtTokenInstance = null;
let ioClientInstance = null;

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
  HttpError,
  emitError(socket, status, msg) {
    const { app, logger, helper } = this;
    const message = msg || status.msg;
    logger.debug(
      `[IMERROR] socketId: ${socket.id} code: ${status.code} msg: ${message}`
    );
    app.gateway.IMERROR(this, socket, helper.parseIOMsg('IMERROR', null, status.code, { msg: message }));
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
