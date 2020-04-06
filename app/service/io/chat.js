'use strict';

const Service = require('egg').Service;

class ChatService extends Service {
  async checkAuthToken(token) {
    console.log('auth', token);
    return true;
  }
}

module.exports = ChatService;

