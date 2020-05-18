'use strict';

module.exports = () => {
  return async function groupauth(ctx, next) {
    try {
      const { params, service, request } = ctx;
      const { userId } = request;

      const groupInfo = await service.io.group.find(params.id);

      if (groupInfo && groupInfo.onlyOwner && userId !== `${groupInfo.owner}`) {
        ctx.body = {
          code: 1,
          msg: '[GROUP] only update by owner',
        };
        return;
      }

      ctx.groupInfo = groupInfo;
      await next();
    } catch (error) {
      throw new Error(error);
    }
  };
};
