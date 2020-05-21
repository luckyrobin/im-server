'use strict';

module.exports = () => {
  return async function apiauth(ctx, next) {
    const { helper, app } = ctx;
    try {
      const authorization = ctx.request.header.authorization;
      if (!authorization) throw new helper.HttpError(app.config.errorCode.RE_LOGIN);
      const result = await ctx.app.redis.get(authorization);
      // if (!result) throw new helper.HttpError(app.config.errorCode.RE_LOGIN);
      ctx.request.userId = result || '5eba5dad2dded04bd7e37881';
      await next();
    } catch (e) {
      ctx.body = {
        code: e.code,
        msg: e.message || '[AUTH] ERROR',
      };
    }
  };
};
