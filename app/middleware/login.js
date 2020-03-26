module.exports = () => {
    return async function login(ctx, next) {
      try {

        // console.log('-----------------',ctx.cookies.get('EGG_SESS', {
        //     signed: false
        // }));
        const authorization = ctx.request.header.authorization;

        if (authorization) {
            const result = await ctx.app.redis.get(authorization);
            // console.log('result', result)
            if (result) {
                await next();
            } else {
                // ctx.body = '未登录'
                ctx.body = {
                    code: 401,
                    msg: '未登录'
                }
            }
            // console.log('xxxxxxx', result)
        } else {
            // await next();
            ctx.body = {
                code: 401,
                msg: '未登录'
            };
        }
      } catch (err) {
        throw new Error(err);
      }
    };
  };
