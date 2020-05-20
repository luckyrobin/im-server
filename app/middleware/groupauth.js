'use strict';

module.exports = () => {
  return async function groupauth(ctx, next) {
    try {
      const { params, service, request, helper } = ctx;
      const { body, userId } = request;

      const groupInfo = await service.io.group.find(params.id);

      if (!groupInfo) throw new helper.HttpError(`[GROUP] current groupId ${params.id} is not exist`);

      if (groupInfo && groupInfo.onlyOwner && userId !== `${groupInfo.owner}`) {
        throw new helper.HttpError('[GROUP] only update by owner');
      }

      if (Reflect.has(body, 'owner') || Reflect.has(body, 'onlyOwner')) {
        if (userId !== `${groupInfo.owner}`) {
          throw new helper.HttpError('[GROUP] owner and onlyOwner only update by owner');
        }
      }

      ctx.groupInfo = groupInfo;
      await next();
    } catch (e) {
      ctx.body = {
        code: e.code,
        msg: e.message || '[GROUP] ERROR',
      };
    }
  };
};
