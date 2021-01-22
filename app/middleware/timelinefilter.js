'use strict';

module.exports = () => {
  return async function timelinefilter(ctx, next) {
    try {
      const { params, request, HttpError, helper, service } = ctx;
      const { body, userId } = request;

      // 鉴别当前用户是否属于既定会话
      const conversation = helper.parseTimelineId(params.id);
      if (conversation.from !== userId) {
        throw new HttpError('[TIMELINE] current conversation is not belong to you');
      }

      // 只有群聊会话框才能保存至通讯录
      if (Reflect.has(body, 'saved')) {
        const groupInfo = await service.io.group.find(conversation.to);
        if (!groupInfo) throw new HttpError('[TIMELINE] only group timeline could set `saved`');
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
