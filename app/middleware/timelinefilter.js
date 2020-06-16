'use strict';

module.exports = () => {
  return async function timelinefilter(ctx, next) {
    try {
      const { params, request, HttpError } = ctx;
      const { userId } = request;

      // 鉴别当前用户是否属于既定会话
      const conversation = params.id.split('@');
      if (conversation[0] !== userId) {
        throw new HttpError('[TIMELINE] current conversation is not belong to you');
      }
      await next();
    } catch (e) {
      ctx.body = {
        code: e.code,
        msg: e.message || '[TIMELINE] ERROR',
      };
    }
  };
};
