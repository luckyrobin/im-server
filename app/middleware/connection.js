'use strict';

module.exports = () => {
  return async function connection(ctx, next) {
    try {
      const authorization = ctx.request.header.authorization;
      // test
      ctx.request.userId = '5eba5dad2dded04bd7e37881';
      await next();
    } catch (err) {
      throw new Error(err);
    }
  };
};
