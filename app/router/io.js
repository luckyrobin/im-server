'use strict';

// The gateway
module.exports = {
  gw_receive: app => {
    const { io } = app;
    // route is equivalent to socket.on(eventName, callback)
    // https://github.com/eggjs/egg-socket.io/blob/master/lib/socket.io/namespace.js#L19
    io.of('/sso').route(app.config.emitsheet.SSO_QRLOGIN, app.io.controller.sso.qrlogin);
    // chat
    io.of('/chat').route(app.config.emitsheet.CHAT_TO, app.io.controller.chat.to);
  },
  gw_emit: {
    IMERROR: (ctx, message) => {
      const { app, socket } = ctx;
      socket.emit(
        app.config.emitsheet.IMERROR,
        message
      );
    },
    SSO_QRLOGIN: (ctx, socketId, message) => {
      const { app } = ctx;
      app.io.of('/sso').to(socketId).emit(
        app.config.emitsheet.SSO_QRLOGIN,
        message
      );
    },
    CHAT_MESSAGE: (ctx, socketId, message) => {
      const { app } = ctx;
      app.io.of('/chat').to(socketId).emit(
        app.config.emitsheet.CHAT_MESSAGE,
        message
      );
    },
    CHAT_ONLINE: (ctx, message) => {
      const { app } = ctx;
      app.io.of('/chat').emit(
        app.config.emitsheet.CHAT_ONLINE,
        message
      );
    },
    CHAT_GLEAVE: (ctx, message) => {
      const { app } = ctx;
      app.io.of('/chat').emit(
        app.config.emitsheet.CHAT_GLEAVE,
        message
      );
    },
    CHAT_TO_ACK: (ctx, socketId, message) => {
      const { app } = ctx;
      app.io.of('/chat').to(socketId).emit(
        app.config.emitsheet.CHAT_TO_ACK,
        message
      );
    },
  },
};
