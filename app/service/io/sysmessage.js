'use strict';

const Service = require('egg').Service;

class SysMessageService extends Service {
  async task(msg) {
    try {
      const { service } = this.ctx;
      const mqmsg = this.fakeMqmsg(msg);
      // 1. 同步：消息存储库 -- 读扩散
      const savedmsg = await service.io.chat.save2Store(mqmsg);
      if (typeof savedmsg !== 'object' || !Reflect.has(savedmsg, '_id')) return;
      // 2. 异步：更新 timeline
      service.io.chat.save2Timeline(savedmsg);
      // 3. 同步：消息同步库 -- 写扩散
      await service.io.chat.save2Sync(savedmsg);
    } catch (e) {
      console.error(e);
    }
  }

  fakeMqmsg(savemsg) {
    const { helper, app } = this.ctx;
    const { _id, ...other } = savemsg;
    const message = {
      from: other.creator,
      to: app.mongoose.Types.ObjectId(app.config.systemMessgeObjectId),
      type: 1,
      content: JSON.stringify(other),
      typeu: 3,
      fp: helper.uuid(30),
    };
    return {
      id: _id,
      message: JSON.stringify(message),
      sent: _id.getTimestamp().valueOf().toFixed(3),
    };
  }
}

module.exports = SysMessageService;
