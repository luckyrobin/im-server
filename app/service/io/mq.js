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
    if (mqlist.includes('mqName')) {
      return;
    }
    app.mq.createQueue({ qname: mqName, maxsize: -1 }, (err, resp) => {
      if (err) {
        logger.error(`[CHAT] ${mqName} MQ: ${err}`);
        return;
      }
      if (resp === 1) {
        logger.info(`[CHAT] ${mqName} MQ: has created`);
      }
    });
  }

  async getList() {
    const { logger, app } = this.ctx;
    return new Promise((resolve, reject) => {
      app.mq.listQueues((err, queues) => {
        if (err) {
          logger.error(`[CHAT] MQ: ${err}`);
          reject(err);
        }
        resolve(queues);
      });
    });
  }

  async remove(mqName) {
    const { logger, app } = this.ctx;
    if (!mqName) {
      logger.error("[CHAT] MQ: miss the 'mqName'");
      return;
    }
    app.mq.deleteQueue({ qname: mqName }, (err, resp) => {
      if (err) {
        logger.error(`[CHAT] ${mqName} MQ: ${err}`);
        return;
      }
      if (resp === 1) {
        logger.info(`[CHAT] ${mqName} MQ: Queue and all messages deleted`);
      } else {
        logger.info(`[CHAT] ${mqName} MQ: Queue not found`);
      }
    });
  }

  async send(mqName, message) {
    const { logger, app } = this.ctx;
    return new Promise((resolve, reject) => {
      app.mq.sendMessage({ qname: mqName, message }, (err, resp) => {
        if (err) {
          logger.error(`[CHAT] ${mqName} MQ: ${err}`);
          reject(err);
        }
        resolve(resp);
      });
    });
  }

  async receive(mqName, cb) {
    const { logger, app } = this.ctx;
    app.mq.receiveMessage({ qname: mqName }, (err, resp) => {
      if (err) {
        logger.error(`[CHAT] ${mqName} MQ: ${err}`);
        return;
      }
      if (resp.id) {
        cb(resp);
      }
    });
  }
}

module.exports = mqService;

