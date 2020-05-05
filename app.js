'use strict';

const RedisSMQ = require('rsmq');
const gateway = require('./app/router/io').gw_emit;

class AppBootHook {
  constructor(app) {
    this.app = app;
    app.mq = new RedisSMQ({ client: app.redis });
    app.gateway = gateway;
  }

  async serverDidReady() {
    const ctx = await this.app.createAnonymousContext();
    await ctx.service.io.mq.create(this.app.config.globalchannel);
  }
}

module.exports = AppBootHook;
