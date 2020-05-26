'use strict';

module.exports = () => {
  return async function rftfilter(ctx, next) {
    const { HttpError, app } = ctx;
    try {
      const token = ctx.request.header.authorization;
      if (!token) throw new HttpError(app.config.errorCode.RE_LOGIN);
      const { rft, phone, uid, dt } = ctx.jwtToken.parse(token);

      // 检查 refresh token 是否过期
      const existed = await ctx.jwtToken.checkrft(rft);
      if (!existed) throw new HttpError(app.config.errorCode.RE_LOGIN);
      const newToken = await ctx.jwtToken.generate({ phone, uid, dt });
      ctx.body = {
        msg: 'get refresh token succeed',
        data: {
          token: newToken,
        },
        code: 0,
      };
      await next();
    } catch (e) {
      ctx.body = {
        code: e.code,
        msg: e.message || '[RFT] ERROR',
      };
    }
  };
};
