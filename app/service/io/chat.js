'use strict';

const Service = require('egg').Service;
const debounce = require('debounce-promise');
const ObjectPool = require('../../utils/objectpool');

const pool = new ObjectPool({
  POOL_SIZE: 1000,
});

class ChatService extends Service {

  async checkAuthToken(token) {
    const { logger } = this.ctx;
    try {
      this.app.jwt.verify(token, this.app.config.jwt.secret);
    } catch (e) {
      logger.debug(`[CHAT checkAuthToken]: ${e.message}`);
      return false;
    }
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

    try {
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
        readed: savemsg.readed,
        fp: savemsg.fp,
      };
    } catch (e) {
      // fp 唯一性校验不通过
      const { helper, app } = this.ctx;
      if (Reflect.has(message, 'requestQuery')) {
        const deviceType = helper.getDeviceType(message.requestQuery.deviceType);
        const cooked = await this.ctx.ioClient.getCooked(`${message.from}`);
        const socket = this.ctx.getSocketById('/chat', cooked[deviceType]);
        this.ctx.emitError(socket, app.config.errorCode.DB_VALID_FAILED, `[CHAT] failed: ${e.message}`);
      }
      throw new Error(e);
    }
  }

  async save2Sync(savedmsg) {
    const { service } = this.ctx;
    switch (savedmsg.typeu) {
      case 1: {
        return service.io.message.saveCache(savedmsg);
      }
      case 2: {
        const groupMembers = await service.io.group.findMembers(savedmsg.to);
        if (!groupMembers) return false;
        const filterSenderMembers = groupMembers.members.filter(item => `${item}` !== `${savedmsg.from}`);
        return service.io.message.saveCache(savedmsg, filterSenderMembers);
      }
      case 3: // eslint-disable-next-line no-fallthrough
      case 4: {
        const wholeUser = await service.user.findAllUser({ _id: 1 });
        if (!wholeUser) return false;
        const wholeUserIds = wholeUser.map(item => item._id);
        return service.io.message.saveCache(savedmsg, wholeUserIds);
      }
      default:
        return;
    }
  }

  async save2Timeline(savedmsg) {
    const { service, helper } = this.ctx;
    switch (savedmsg.typeu) {
      case 1: {
        const hasCreated = await service.io.timeline.findById(helper.generateTimelineId(savedmsg.from, savedmsg.to));
        if (!hasCreated) {
          service.io.timeline.create(savedmsg);
        } else {
          const fn = function(...p) {
            pool.release(savedmsg.timelineId);
            return service.io.timeline.updateRecentMessage(...p);
          };
          pool.get(savedmsg.timelineId, debounce(fn, 10000))(savedmsg);
        }
        return;
      }
      case 2: {
        const hasCreated = await service.io.timeline.findById(helper.generateTimelineId(savedmsg.from, savedmsg.to));
        if (!hasCreated) {
          service.io.timeline.createBatch(savedmsg);
        } else {
          const fn = function(...p) {
            pool.release(savedmsg.timelineId);
            return service.io.timeline.updateRecentMessageBatch(...p);
          };
          pool.get(savedmsg.timelineId, debounce(fn, 10000))(savedmsg);
        }
        return;
      }
      case 3: // eslint-disable-next-line no-fallthrough
      case 4: {
        service.io.timeline.merge4Whole(savedmsg);
        return;
      }
      default:
        return;
    }
  }

  async to(savedmsg, requestQuery) {
    const { helper, app } = this.ctx;
    const message = savedmsg;

    // has handled through ackAndSync
    if (`${message.from}` === `${message.to}`) return;

    let currentDeviceSocketId;
    if (typeof requestQuery === 'object' && message.typeu === 2) {
      // 1. get current deviceType
      const deviceType = helper.getDeviceType(requestQuery.deviceType);
      // 2. get current signin device
      const cooked = await this.ctx.ioClient.getCooked(`${message.from}`);
      // 3. get current device socket
      currentDeviceSocketId = cooked[deviceType];
    }

    // typeu is identify field
    // 1: c2c get socketId from redis
    // 2: c2g groupId is equivalent to roomId
    const toSocketIds = [];
    switch (message.typeu) {
      case 1: {
        const cooked = await this.ctx.ioClient.getCooked(message.to);
        Object.keys(cooked).forEach(item => {
          toSocketIds.push(cooked[item]);
        });
        break;
      }
      case 2: {
        toSocketIds.push(`${app.config.roomprefix}${message.to}`);
        break;
      }
      default:
        return;
    }

    await this.toPush(savedmsg, savedmsg.to);


    toSocketIds.forEach(socketId => {
      app.gateway.CHAT_MESSAGE(this.ctx, socketId, helper.parseIOMsg('CHAT_MESSAGE', message, 'success'), currentDeviceSocketId);
    });
  }

  async toPush(savedmsg, userId) {
    const { app, pushClient } = this.ctx;
    const pushDeviceId = await pushClient.get(userId);
    if (!pushDeviceId) return;
    app.pushService.pushNotice(pushDeviceId, '我是谁', savedmsg.content, savedmsg);
  }

  // ack & multiterminal synchronization
  async ackAndSync(savedmsg, requestQuery) {
    const { helper, app } = this.ctx;
    // 1. get current deviceType
    const deviceType = helper.getDeviceType(requestQuery.deviceType);
    // 2. get current signin device
    const cooked = await this.ctx.ioClient.getCooked(`${savedmsg.from}`);
    // 3. get current device socket
    const currentDeviceSocketId = cooked[deviceType];
    // 4. ack to current device
    app.gateway.CHAT_TO_ACK(this.ctx, currentDeviceSocketId, helper.parseIOMsg('CHAT_TO_ACK', savedmsg, 'success'));

    // 同步 c2c 消息到其他设备，由于 c2g 消息是广播类型，所以不需要同步
    if (savedmsg.typeu === 1) {
      const otherDevice = Reflect.ownKeys(cooked).filter(item => item !== deviceType).join('');
      if (!otherDevice) return;
      app.gateway.CHAT_MESSAGE(this.ctx, cooked[otherDevice], helper.parseIOMsg('CHAT_MESSAGE', savedmsg, 'success', { sync: true }));
    }
  }

  _takeRequestQuery(mqmsg) {
    const cookedmsg = JSON.parse(mqmsg.message);
    return cookedmsg.requestQuery;
  }
}

module.exports = ChatService;
