'use strict';

module.exports = app => (
  class ToTask extends app.Subscription {
    static get schedule() {
      return {
        type: app.config.customAgents.AGENT_TO,
      };
    }
    async subscribe() {
      const { service, app } = this.ctx;
      try {
        const mqmsg = await service.io.mq.pop(app.config.globalchannel);
        if (typeof mqmsg !== 'object' || !Reflect.has(mqmsg, 'id')) return;
        // 1. 同步：消息存储库 -- 读扩散
        const savedmsg = await service.io.chat.save2Store(mqmsg);
        if (typeof savedmsg !== 'object' || !Reflect.has(savedmsg, '_id')) return;
        // 2. 异步：更新 timeline
        service.io.chat.save2Timeline(savedmsg);
        // 3. 同步：消息同步库 -- 写扩散
        await service.io.chat.save2Sync(savedmsg);
        // 4. 异步：应答消息 & 同步到其他登录终端
        service.io.chat.ackAndSync(savedmsg, service.io.chat._takeRequestQuery(mqmsg));
        // 5. 异步：发送消息
        service.io.chat.to(savedmsg, service.io.chat._takeRequestQuery(mqmsg));
      } catch (error) {
        this.ctx.logger.error(`[CHAT] globalchannel MQ consumer -> schedule task: ${error}`);
      }
    }
  }
);
