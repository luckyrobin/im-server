module.exports = app => {

    app.sessionStore = {
      async get(key) {
        // const res = await app.redis.get(key);
        // if (!res) return null;
        // return JSON.parse(res);
        // console.log('!!!!!!!!!!!!', key);
        const res = await app.model.SessionUser.find({
            sessionId: key
        });
        // console.log('!!!!!!!!!!!!', res);
        return res;
      },
  
      async set(key, value, maxAge) {

        // var SessionUserInstance = new app.model.SessionUser({
        //     user: value.user,
        //     sessionId: key
        // });
        
        // const res = await SessionUserInstance.save();
        // console.log('session存储结果', res);

        console.log('====', key, value)
      },
  
      async destroy(key) {
        // await app.redis.del(key);
        // console.log('-------', key);
        const res = await app.model.SessionUser.remove({
            sessionId: key
        });

        console.log('session销毁结果', res);
      },
    };
  };
