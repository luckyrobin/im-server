'use strict';

// const uaParser = require('ua-parser-js');

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
  getDeviceType(dt) {
    // get deviceType from socket.handshake.query
    // becase socket.io not support extraHeaders and ua is unsureness
    // https://github.com/socketio/engine.io-client/issues/554#issuecomment-336775975
    const DEVICES = {
      desktop: 'DESKTOP',
      mobile: 'MOBILE',
    };
    // const parsed = uaParser(ua);
    const parsed = DEVICES[dt];
    return parsed;
  },
  generateTimelineId(from, to) {
    return `${from}@${to}`;
  },
  parseTimelineId(timelineId) {
    const temp = timelineId.split('@');
    return {
      from: temp[0],
      to: temp[1],
    };
  },
  parseFileMimeType(stream) {
    const mimeType = stream.mimeType;
    if (/image*/.test(mimeType)) {
      return 2;
    }

    if (/audio*/.test(mimeType)) {
      return 3;
    }

    return false;
  },
  async genMessageTypeField(stream, upload, type) {
    if (type === 2) {
      return {
        origin: `${upload.url}?x-oss-process=image/format,jpg`,
        thumb: `${upload.url}?x-oss-process=image/format,jpg/quality,q_10/resize,p_10`,
        filename: upload.name,
        tag: upload.res.headers.etag,
      };
    }
    if (type === 3) {
      return {
        origin: `${upload.url}`,
        duration: '',
        filename: upload.name,
        tag: upload.res.headers.etag,
      };
    }
  },
};
