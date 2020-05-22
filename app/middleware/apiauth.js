'use strict';

module.exports = () => {
  return async function apiauth(ctx, next) {
    const { HttpError, app } = ctx;
    try {
      const token = ctx.request.header.authorization;
      if (!token) throw new HttpError(app.config.errorCode.RE_LOGIN);
      const verify = ctx.jwtToken.check(token);
      ctx.request.userId = verify.uid;
      await next();
    } catch (e) {
      ctx.body = {
        code: e.code,
        msg: e.message || '[AUTH] ERROR',
      };
    }
  };
};
