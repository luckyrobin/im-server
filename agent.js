'use strict';

function InitRedisStrategy(agent, name, channel) {
  class RedisStrategy extends agent.ScheduleStrategy {
    start() {
      // 订阅其他的分布式调度服务发送的消息，收到消息后让一个进程执行定时任务
      agent.redis.on('message', (c, message) => {
        if (c === channel) {
          // count 为当前队列中的消息数量
          let count = parseInt(message);
          if (isNaN(count) || typeof count !== 'number') {
            agent.logger.error(`[CHAT] ${channel} -> agent: count: ${count} is illegal`);
            return;
          }
          // 避免消息堆积
          while (count > 0) {
            this.sendOne(count);
            count--;
          }
        }
      });
    }
  }

  agent.schedule.use(name, RedisStrategy);
}

module.exports = agent => {
  const redisNSP = `rsmq:rt:${agent.config.globalchannel}`;

  agent.messenger.on('egg-ready', () => {
    agent.redis.subscribe(redisNSP);
  });

  InitRedisStrategy(agent, agent.config.customAgents.AGENT_TO, redisNSP);
};
