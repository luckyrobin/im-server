'use strict';

const uaParser = require('ua-parser-js');

module.exports = {
  parseIOMsg(action, payload = {}, type, metadata = {}) {
    const meta = Object.assign(
      {},
      {
        timestamp: Date.now(),
      },
      metadata
    );
    const code = type === 'success' ? 0 : type === 'fail' ? 1 : type;
    return {
      meta,
      code,
      data: {
        action,
        payload,
      },
    };
  },
  emitError(socket, status, msg) {
    const { app, logger } = this;
    const message = msg || status.msg;
    logger.debug(
      `[IMERROR] socketId: ${socket.id} code: ${status.code} msg: ${message}`
    );

    app.gateway.IMERROR({ ...this, socket }, this.parseIOMsg('IMERROR', null, status.code, { msg: message }));
  },
  lazyCloseSocket(socket) {
    setTimeout(() => {
      if (socket && socket.connected) {
        socket.disconnect(true);
      }
    }, 300);
  },
  escapeString(string) {
    return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function(
      character
    ) {
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
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < len; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
  getDeviceType(ua) {
    const DEVICES = [ 'DESKTOP', 'MOBILE' ];
    let index = 0;
    const parsed = uaParser(ua);
    if (parsed.device.type === 'mobile') {
      index = 1;
    }
    return DEVICES[index];
  },
};
