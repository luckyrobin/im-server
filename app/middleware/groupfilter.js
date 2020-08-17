'use strict';

module.exports = () => {
  return async function groupfilter(ctx, next) {
    try {
      const { params, service, request, HttpError } = ctx;
      const { body, userId } = request;

      const groupInfo = await service.io.group.find(params.id);

      const inGroup = await service.io.chat.checkUserInGroup(userId, params.id);
      if (!inGroup) {
        throw new HttpError(`[Group] group is dissolved or you are not members of group ${params.id}`);
      }

      if (!groupInfo) throw new HttpError(`[GROUP] current groupId ${params.id} is not exist`);

      if (groupInfo && groupInfo.onlyOwner && userId !== `${groupInfo.owner}`) {
        throw new HttpError('[GROUP] only update by owner');
      }

      if (Reflect.has(body, 'owner') || Reflect.has(body, 'onlyOwner')) {
        if (userId !== `${groupInfo.owner}`) {
          throw new HttpError('[GROUP] owner and onlyOwner only update by owner');
        }
      }

      if (Reflect.has(body, 'membersUpdate')) {
        const addReg = /^\+/g;
        const removeReg = /^\-/g;
        const membersUpdate = body.membersUpdate;
        await Promise.all(membersUpdate.map(async member => {
          const existed = await service.io.chat.checkUserInGroup(member.substr(1), params.id);
          if (addReg.test(member) && existed) throw new HttpError(`${member.substr(1)}已存在群组中，请勿重复更新`);
          if (removeReg.test(member) && !existed) throw new HttpError(`${member.substr(1)}已经不在群组中，请勿重复更新`);
        }));
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
