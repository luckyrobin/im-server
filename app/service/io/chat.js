'use strict';

const Service = require('egg').Service;
const debounce = require('debounce-promise');

let InitDebounceUpdateRecentMessage = null;

class ChatService extends Service {

  async checkAuthToken() {
    return true;
  }

  async checkUserInGroup(userId, groupId) {
    const { service } = this.ctx;
    const groupMembers = await service.io.group.findMembers(groupId);
    if (!groupMembers) return false;
    return groupMembers.members.includes(userId);
  }

  async save2Store(mqmsg) {
    const { service } = this.ctx;
    const message = { ...JSON.parse(mqmsg.message), sequenceId: mqmsg.sent };
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
    return service.io.message.saveCache(savedmsg);
  }

  async save2Timeline(savedmsg) {
    const { service, model, helper } = this.ctx;
    const hasCreated = await model.Timeline.findById(helper.generateTimelineId(savedmsg.from, savedmsg.to));
    if (!hasCreated) {
      service.io.timeline.save(savedmsg);
    } else {
      this._debounceUpdateRecentMessage()(savedmsg);
    }
  }

  async to(savedmsg) {
    const { helper, app, service } = this.ctx;
    const message = savedmsg;

    // has handled through ackAndSync
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

    toSocketIds.forEach(socketId => {
      app.gateway.CHAT_MESSAGE(this.ctx, socketId, helper.parseIOMsg('CHAT_MESSAGE', message, 'success'));
    });
  }

  // ack & multiterminal synchronization
  async ackAndSync(mqmsg, savedmsg) {
    const { service, helper, app } = this.ctx;
    const cookedmsg = JSON.parse(mqmsg.message);
    // 1. get current deviceType
    const deviceType = helper.getDeviceType(cookedmsg.requestQuery.deviceType);
    // 2. get current signin device
    const cooked = await service.io.client.getCooked(`${savedmsg.from}`);
    // 3. get current device socket
    const currentDevice = Reflect.ownKeys(cooked).filter(item => item === deviceType).join('');
    // 4. ack to current device
    app.gateway.CHAT_TO_ACK(this.ctx, cooked[currentDevice], helper.parseIOMsg('CHAT_TO_ACK', savedmsg, 'success'));

    // 同步 c2c 消息，由于 c2g 消息是广播类型，所以不需要同步
    if (savedmsg.typeu === 1) {
      const otherDevice = Reflect.ownKeys(cooked).filter(item => item !== deviceType).join('');
      if (!otherDevice) return;
      app.gateway.CHAT_MESSAGE(this.ctx, cooked[otherDevice], helper.parseIOMsg('CHAT_MESSAGE', savedmsg, 'success', { sync: true }));
    }
  }

  _debounceUpdateRecentMessage() {
    if (!InitDebounceUpdateRecentMessage) {
      const { service } = this.ctx;
      const fn = function(p) {
        return service.io.timeline.updateRecentMessage(p);
      };
      InitDebounceUpdateRecentMessage = debounce(fn, 10000);
    }
    return InitDebounceUpdateRecentMessage;
  }
}

module.exports = ChatService;
