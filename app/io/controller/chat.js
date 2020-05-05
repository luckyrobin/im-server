'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async to() {
    const { helper, app, service } = this.ctx;
    const mqPop = await service.io.mq.ack(app.config.globalchannel);
    const message = { ...JSON.parse(mqPop.message), sequenceId: mqPop.sent };
    console.log(message, mqPop);
    // const s = await service.io.messageStore.save(message);
    // console.log('ssss', s);
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
}

module.exports = ChatController;
