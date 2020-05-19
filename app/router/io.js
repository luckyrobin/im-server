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

    io.of('/chat').route(app.config.emitsheet.CHAT_PULL_RECENT_CONVERSATION, app.io.controller.chat.getRecentConversations);

    io.of('/chat').route(app.config.emitsheet.CHAT_PULL_OFFLINE_MESSAGE, app.io.controller.chat.getOfflineMessages);

    io.of('/chat').route(app.config.emitsheet.CHAT_MESSAGE_ACK, app.io.controller.chat.clientHasReceived);

    io.of('/chat').route(app.config.emitsheet.CHAT_PULL_HISTORY_MESSAGE, app.io.controller.chat.getHistoryMessage);

    io.of('/chat').route(app.config.emitsheet.CHAT_TO_READED, app.io.controller.chat.markReader);
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
    CHAT_GROUP_NOTICE: (ctx, socketId, message) => {
      const { app } = ctx;
      app.io.of('/chat').to(socketId).emit(
        app.config.emitsheet.CHAT_GROUP_NOTICE,
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
    CHAT_PULL_RECENT_CONVERSATION: (ctx, socketId, message) => {
      const { app } = ctx;
      app.io.of('/chat').to(socketId).emit(
        app.config.emitsheet.CHAT_PULL_RECENT_CONVERSATION,
        message
      );
    },
    CHAT_PULL_OFFLINE_MESSAGE: (ctx, socketId, message) => {
      const { app } = ctx;
      app.io.of('/chat').to(socketId).emit(
        app.config.emitsheet.CHAT_PULL_OFFLINE_MESSAGE,
        message
      );
    },
    CHAT_PULL_HISTORY_MESSAGE: (ctx, socketId, message) => {
      const { app } = ctx;
      app.io.of('/chat').to(socketId).emit(
        app.config.emitsheet.CHAT_PULL_HISTORY_MESSAGE,
        message
      );
    },
    CHAT_TO_READED: (ctx, socketId, message) => {
      const { app } = ctx;
      app.io.of('/chat').to(socketId).emit(
        app.config.emitsheet.CHAT_TO_READED,
        message
      );
    },
  },
};
