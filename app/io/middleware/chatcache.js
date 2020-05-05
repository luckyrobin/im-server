'use strict';

module.exports = app => {
  return async (ctx, next) => {
    // const { service } = ctx;
    // const message = ctx.packet[1];
    // await service.io.mq.send(app.config.globalchannel, JSON.stringify(message));
    await next();
  };
};
