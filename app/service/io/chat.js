'use strict';

const Service = require('egg').Service;

class ChatService extends Service {
  async checkAuthToken(token) {
    return true;
  }
}

module.exports = ChatService;

