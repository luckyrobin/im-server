'use strict';

module.exports = {
  parseIOMsg(action, payload = {}, type, metadata = {}) {
    const meta = Object.assign({}, {
      timestamp: Date.now(),
    }, metadata);
    const code = type === 'success' ? 0 : (type === 'fail' ? 1 : type);
    return {
      meta,
      code,
      data: {
        action,
        payload,
      },
    };
  },
  lazyCloseSocket(socket, log) {
    const { logger } = this.app;
    logger.debug(log);
    setTimeout(() => {
      if (socket && socket.connected) {
        socket.disconnect(true);
      }
    }, 300);
  },
};
