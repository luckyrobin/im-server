'use strict';

const Service = require('egg').Service;

class mqService extends Service {

  async create(mqName) {
    const { logger, app } = this.ctx;
    if (!mqName) {
      logger.error("[CHAT] MQ: miss the 'mqName'");
      return;
    }
    const mqlist = await this.getList();
    if (mqlist.includes(mqName)) return;
    return app.mq.createQueueAsync({ qname: mqName, maxsize: -1 })
      .then(() => logger.info(`[CHAT] ${mqName} MQ: has created`))
      .catch(err => {
        logger.error(`[CHAT] ${mqName} MQ: ${err}`);
      });
  }

  async getList() {
    const { logger, app } = this.ctx;
    return app.mq.listQueuesAsync()
      .catch(err => {
        logger.error(`[CHAT] MQ: ${err}`);
      });
  }

  async remove(mqName) {
    const { logger, app } = this.ctx;
    if (!mqName) {
      logger.error("[CHAT] MQ: miss the 'mqName'");
      return;
    }
    return app.mq.deleteQueueAsync({ qname: mqName })
      .then(resp => resp !== 1 && logger.info(`[CHAT] ${mqName} MQ: Queue not found`))
      .catch(err => {
        logger.error(`[CHAT] ${mqName} MQ: ${err}`);
      });
  }

  async send(mqName, message) {
    const { logger, app } = this.ctx;
    return app.mq.sendMessageAsync({ qname: mqName, message })
      .catch(err => {
        logger.error(`[CHAT] ${mqName} MQ: ${err}`);
      });
  }

  async receive(mqName) {
    const { logger, app } = this.ctx;
    return app.mq.receiveMessageAsync({ qname: mqName })
      .catch(err => {
        logger.error(`[CHAT] ${mqName} MQ: ${err}`);
      });
  }

  async delete(mqName) {
    const { logger, app } = this.ctx;
    return app.mq.deleteMessageAsync({ qname: mqName })
      .catch(err => {
        logger.error(`[CHAT] ${mqName} MQ: ${err}`);
      });
  }

  async ack(mqName) {
    const { logger, app } = this.ctx;
    return app.mq.popMessageAsync({ qname: mqName })
      .catch(err => {
        logger.error(`[CHAT] ${mqName} MQ: ${err}`);
      });
  }
}

module.exports = mqService;

