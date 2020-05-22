'use strict';

const JwtToken = require('./mount/jwttoken');
const IOClient = require('./mount/ioclient');
const HttpError = require('./mount/httperror');

const jwtSymbol = Symbol('Context#JwtToken');
const ioSymbol = Symbol('Context#IOClient');

module.exports = {
  get jwtToken() {
    if (!this[jwtSymbol]) {
      this[jwtSymbol] = new JwtToken(this);
    }
    return this[jwtSymbol];
  },
  get ioClient() {
    if (!this[ioSymbol]) {
      this[ioSymbol] = new IOClient(this);
    }
    return this[ioSymbol];
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
