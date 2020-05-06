'use strict';

// RedisSMQ support ioredis
// issue https://github.com/smrchy/rsmq/pull/57/commits#issuecomment-523725394
module.exports = ioredisClient => {
  return new Proxy(ioredisClient, {
    get(target, key) {
      if (key === 'constructor') {
        return { name: 'RedisClient' };
      }
      if (key === 'connected') {
        return target.status === 'ready';
      }
      if (key === 'multi') {
        // Note that `multi` proxy is minimal wrapping for RSMQ.
        return new Proxy(target[key], {
          apply(target, thisArg, argArray) {
            return new Proxy(target.apply(thisArg, argArray), {
              get(target2, key2) {
                if (key2 === 'exec') {
                  return cb => {
                    target2.exec((err, res) => {
                      cb(
                        err,
                        res
                          ? res.map(([ err, val ]) => {
                            if (err) {
                              throw err;
                            }
                            return val;
                          })
                          : res
                      );
                    });
                  };
                // eslint-disable-next-line no-else-return
                } else {
                  return target2[key2];
                }
              },
            });
          },
        });
      // eslint-disable-next-line no-else-return
      } else {
        return target[key];
      }
    },
  });
};
