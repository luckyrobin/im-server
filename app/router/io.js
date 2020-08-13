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

    io.of('/chat').route(app.config.emitsheet.CHAT_TO_TYPING, app.io.controller.chat.markTyping);

    io.of('/chat').route(app.config.emitsheet.CHAT_TO_UNDO, app.io.controller.chat.undo);

    io.of('/chat').route(app.config.emitsheet.CHAT_PULL_READED_MESSAGE, app.io.controller.chat.getReadedList);
  },
  gw_emit: {
    IMERROR: (ctx, socket, message) => {
      const { app } = ctx;
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
    CHAT_MESSAGE: (ctx, socketId, message, senderSocketId) => {
      const { app } = ctx;
      // 如果有发送者的 socketId，则直接用发送者的 socket 发送，否则 nsp 直接发送
      if (senderSocketId) {
        const socket = ctx.getSocketById('/chat', senderSocketId);
        socket.to(socketId).emit(
          app.config.emitsheet.CHAT_MESSAGE,
          message
        );
        return;
      }
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
    CHAT_TO_TYPING: (ctx, socketId, message) => {
      const { app } = ctx;
      app.io.of('/chat').to(socketId).emit(
        app.config.emitsheet.CHAT_TO_TYPING,
        message
      );
    },
    CHAT_MESSAGE_ALL: (ctx, message) => {
      const { app } = ctx;
      app.io.of('/chat').emit(
        app.config.emitsheet.CHAT_MESSAGE,
        message
      );
    },
  },
};
