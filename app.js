'use strict';

const RedisSMQ = require('rsmq');
const gateway = require('./app/router/io').gw_emit;
const supportioredis = require('./patch/support');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didLoad() {
    // doc: https://github.com/smrchy/rsmq
    this.app.mq = new RedisSMQ({ client: supportioredis(this.app.redis) });
    this.app.gateway = gateway;
  }

  async serverDidReady() {
    const ctx = await this.app.createAnonymousContext();
    await ctx.service.io.mq.create(this.app.config.globalchannel);
  }
}

module.exports = AppBootHook;
