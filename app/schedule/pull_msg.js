'use strict';

module.exports = {
  schedule: {
    interval: 30,
    type: 'all',
  },
  async task(ctx) {
    const mqmsg = await ctx.service.io.mq.ack('globalchannel');
    if (!Reflect.has(mqmsg, 'id')) return;
    const savedmsg = await ctx.service.io.chat.save2Store(mqmsg);
    await ctx.service.io.chat.sync(mqmsg, savedmsg);
    await ctx.service.io.chat.to(savedmsg);
  },
};
