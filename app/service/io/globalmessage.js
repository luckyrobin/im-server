'use strict';

const Service = require('egg').Service;

class GlobalMessageService extends Service {
  async task(mqmsg, cb = () => {}) {
    try {
      const { service, app, helper } = this.ctx;
      // 1. 同步：消息存储库 -- 读扩散
      const savedmsg = await service.io.chat.save2Store(mqmsg);
      if (typeof savedmsg !== 'object' || !Reflect.has(savedmsg, '_id')) return;
      // 2. 异步：更新 timeline
      service.io.chat.save2Timeline(savedmsg);
      // 3. 同步：消息同步库 -- 写扩散
      await service.io.chat.save2Sync(savedmsg);
      // 4. 异步：发送消息
      app.gateway.CHAT_MESSAGE_ALL(this.ctx, helper.parseIOMsg('CHAT_MESSAGE', savedmsg, 'success'));
      // 5. 同步：回填 messageId
      typeof cb === 'function' && cb(savedmsg);
    } catch (e) {
      this.ctx.logger.error(`[GLOBALMESSAGE] custom message task: ${e}`);
    }
  }

  fakeNoteMsg(savemsg) {
    const { helper, app } = this.ctx;
    const { _id, ...other } = savemsg;
    const message = {
      from: other.creator,
      to: app.mongoose.Types.ObjectId(app.config.noteMessgeObjectId),
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

  fakeNoticeMsg(savemsg) {
    const { helper, app } = this.ctx;
    const { _id, ...other } = savemsg;
    const message = {
      from: other.creator,
      to: app.mongoose.Types.ObjectId(app.config.noticeMessgeObjectId),
      type: 1,
      content: JSON.stringify(other),
      typeu: 4,
      fp: helper.uuid(30),
    };
    return {
      id: _id,
      message: JSON.stringify(message),
      sent: _id.getTimestamp().valueOf().toFixed(3),
    };
  }
}

module.exports = GlobalMessageService;
