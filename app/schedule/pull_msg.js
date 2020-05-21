'use strict';

module.exports = {
  schedule: {
    interval: 30,
    type: 'all',
  },
  async task(ctx) {
    try {
      const mqmsg = await ctx.service.io.mq.pop(ctx.app.config.globalchannel);
      if (typeof mqmsg !== 'object' || !Reflect.has(mqmsg, 'id')) return;
      // 1. 同步：消息存储库 -- 读扩散
      const savedmsg = await ctx.service.io.chat.save2Store(mqmsg);
      if (typeof savedmsg !== 'object' || !Reflect.has(savedmsg, '_id')) return;
      // 2. 异步：更新 timeline
      ctx.service.io.chat.save2Timeline(savedmsg);
      // 3. 同步：消息同步库 -- 写扩散
      await ctx.service.io.chat.save2Sync(savedmsg);
      // 4. 异步：应答消息 & 同步到其他登录终端
      ctx.service.io.chat.ackAndSync(mqmsg, savedmsg);
      // 5. 异步：发送消息
      ctx.service.io.chat.to(savedmsg);
    } catch (error) {
      ctx.logger.error(`[CHAT] globalchannel MQ consumer -> schedule task: ${error}`);
    }
  },
};
