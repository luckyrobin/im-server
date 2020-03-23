module.exports = () => {
    return async function login(ctx, next) {
      try {

        // console.log('-----------------',ctx.cookies.get('EGG_SESS', {
        //     signed: false
        // }));
        const egg_session = ctx.cookies.get('EGG_SESS', {
            signed: false
        });
        
        if (egg_session) {
            const result = await ctx.model.SessionUser.findOne({
                sessionId: egg_session
            });
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
