'use strict';

const Service = require('egg').Service;

class ChatService extends Service {
  async checkAuthToken() {
    return true;
  }

  async checkUserInGroup(userId, groupId) {
    const { service } = this.ctx;
    const groupMembers = await service.group.findMembers(groupId);
    if (!groupMembers) return false;
    return groupMembers.members.includes(userId);
  }

  async save2Store(mqmsg) {
    const { service } = this.ctx;
    const message = { ...JSON.parse(mqmsg.message), _id: mqmsg.id, sequenceId: mqmsg.sent };
    const savemsg = await service.io.message.saveDB(message);
    return {
      _id: savemsg._id,
      from: savemsg.from,
      to: savemsg.to,
      type: savemsg.type,
      content: savemsg.content,
      typeu: savemsg.typeu,
      sequenceId: savemsg.sequenceId,
      send_time: savemsg.send_time,
      timelineId: savemsg.timelineId,
      fp: message.fp,
    };
  }

  async save2Sync(savedmsg) {
    const { service } = this.ctx;
    return await service.io.message.saveCache(savedmsg);
  }

  async to(savedmsg) {
    const { helper, app, service } = this.ctx;
    const message = savedmsg;
    if (`${message.from}` === `${message.to}`) return;

    // typeu is identify field
    // 1: c2c get socketId from redis
    // 2: c2g groupId is equivalent to roomId
    const toSocketIds = [];
    switch (message.typeu) {
      case 1: {
        const cooked = await service.io.client.getCooked(message.to);
        Object.keys(cooked).forEach(item => {
          toSocketIds.push(cooked[item]);
        });
        break;
      }
      case 2: {
        toSocketIds.push(`${app.config.ROOMPREFIX}${message.to}`);
        break;
      }
      default:
        return;
    }
    // escape the content
    const escapeMessage = { ...message, ...{ content: helper.escapeString(message.content) } };

    toSocketIds.forEach(socketId => {
      app.gateway.CHAT_MESSAGE(this.ctx, socketId, helper.parseIOMsg('CHAT_MESSAGE', { ...escapeMessage }, 'success'));
    });
  }

  // multiterminal synchronization
  async syncToOtherDevice(mqmsg, savedmsg) {
    const { service, helper, app } = this.ctx;
    const rawmsg = JSON.parse(mqmsg.message);
    const deviceType = helper.getDeviceType(rawmsg.requestHeaders['user-agent']);
    const cooked = await service.io.client.getCooked(`${savedmsg.from}`);
    const currentDevice = Reflect.ownKeys(cooked).filter(item => item === deviceType).join('');
    const escapeMessage = { ...savedmsg, ...{ content: helper.escapeString(savedmsg.content) } };
    // ack
    app.gateway.CHAT_TO_ACK(this.ctx, cooked[currentDevice], helper.parseIOMsg('CHAT_TO_ACK', { ...escapeMessage }, 'success'));

    // 同步 c2c 消息，由于 c2g 消息是广播类型，所以不需要同步
    if (savedmsg.typeu === 1) {
      const otherDevice = Reflect.ownKeys(cooked).filter(item => item !== deviceType).join('');
      if (!otherDevice) return;
      app.gateway.CHAT_MESSAGE(this.ctx, cooked[otherDevice], helper.parseIOMsg('CHAT_MESSAGE', { ...escapeMessage }, 'success', { sync: true }));
    }
  }
}

module.exports = ChatService;
