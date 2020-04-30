'use strict';

const RedisSMQ = require('rsmq');

class AppBootHook {
  constructor(app) {
    this.app = app;
    app.mq = new RedisSMQ({ client: app.redis });
  }

  async serverDidReady() {
    const ctx = await this.app.createAnonymousContext();
    ctx.service.io.mq.create(this.app.config.globalchannel);
  }
}

module.exports = AppBootHook;
