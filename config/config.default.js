/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1584590197781_8973';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    myAppName: 'im',
    // mongoose
    mongoose: {
      url: 'mongodb://127.0.0.1:27017/im', // connect to other docker image port: 27017
      options: {},
    },
    redis: {
      client: {
        port: 6379,          // Redis port
        host: '127.0.0.1',   // Redis host
        password: 'auth',
        db: 0,
      },
    },
    security: {
      csrf: {
        // headerName: 'x-csrf-token',
        enable: false,
      },
    },
    session: {
      encrypt: false,
      signed: false,
      renew: true,
      key: 'EGG_SESS',
      maxAge: 24 * 3600 * 1000,
    },
    // redis: {
    //   client: {
    //     cluster: true,
    //     nodes: [{
    //       host: '127.0.0.1', // connect to other docker image port:
    //       port: '6379',
    //       family: 'user',
    //       password: 'password',
    //       db: 'db',
    //     }],
    //   },
    // },
  };

  return {
    ...config,
    ...userConfig,
  };
};
