'use strict';

class HttpError extends Error {
  constructor(message, code) {
    super();
    this.name = message.name || 'HttpError';
    if (typeof message === 'object') {
      this.code = message.code || 1;
      this.message = typeof code === 'string' ? code : message.msg;
    } else {
      this.message = message;
      this.code = code || 1;
    }
    this.stack = (new Error()).stack;
  }
}

module.exports = HttpError;
