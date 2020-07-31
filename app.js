'use strict';

const RedisSMQ = require('rsmq');
const gateway = require('./app/router/io').gw_emit;
const supportioredis = require('./patch/support');
const generateAccount = require('./patch/testaccount');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didLoad() {
    // doc: https://github.com/smrchy/rsmq
    this.app.mq = new RedisSMQ({ client: supportioredis(this.app.redis), realtime: true });
    this.app.gateway = gateway;
    generateAccount(this.app.redis);
  }

  async serverDidReady() {
    const ctx = await this.app.createAnonymousContext();
    await ctx.service.io.mq.create(this.app.config.globalchannel);
  }
}

module.exports = AppBootHook;
