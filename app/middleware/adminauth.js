'use strict';

module.exports = role => {
  return async function adminauth(ctx, next) {
    try {
      const { app, request, HttpError, service } = ctx;
      const { userId } = request;

      const userData = await service.user.findUser(userId);
      // 如果是超级管理员，放过
      if (userData.auth === 1) {
        return await next();
      }
      // 如果当前用户拥有特定权限，放过
      if (Array.isArray(userData.menuRole) && userData.menuRole.includes(role)) {
        return await next();
      }
      throw new HttpError(app.config.errorCode.AUTH_FAILED);
    } catch (e) {
      ctx.body = {
        code: e.code,
        msg: e.message,
      };
    }
  };
};
