'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  session: true,
  redis: {
    enable: true,
    package: 'egg-redis',
  },
  // issue: request.socket is replaced by egg-socket.io with the socket.io Socket
  // fix: upgrade nodejs to >=10.16.0
  // https://github.com/nodejs/node/issues/26366#issuecomment-470623787
  io: {
    enable: true,
    package: 'egg-socket.io',
  },
  view: {
    enable: true,
    package: 'egg-view',
  },
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  }
};
