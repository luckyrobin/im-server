'use strict';

module.exports = {
  schedule: {
    interval: 30,
    type: 'all',
  },
  async task(ctx) {
    const mqmsg = await ctx.service.io.mq.ack('globalchannel');
    if (!Reflect.has(mqmsg, 'id')) return;
    // 消息存储库 -- 读扩散
    const savedmsg = await ctx.service.io.chat.save2Store(mqmsg);
    ctx.service.io.chat.syncToOtherDevice(mqmsg, savedmsg);
    ctx.service.io.chat.to(savedmsg);
    // 消息同步库 -- 写扩散
    ctx.service.io.chat.save2Sync(savedmsg);
  },
};
