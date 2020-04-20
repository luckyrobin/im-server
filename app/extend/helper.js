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
  escapeString(string) {
    return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function(character) {
      // Escape all characters not included in SingleStringCharacters and
      // DoubleStringCharacters on
      // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
      switch (character) {
        case '"':
        case "'":
        case '\\':
          return '\\' + character;
        // Four possible LineTerminator characters need to be escaped:
        case '\n':
          return '\\n';
        case '\r':
          return '\\r';
        case '\u2028':
          return '\\u2028';
        case '\u2029':
          return '\\u2029';
        default:
          return '';
      }
    });
  },
  uuid(len = 10) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < len; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
};
