'use strict';

module.exports = {
  schedule: {
    interval: 1000,
    type: 'all',
  },
  async task(ctx) {
    // const message = await ctx.service.io.mq.receive('globalchannel');
  },
};
