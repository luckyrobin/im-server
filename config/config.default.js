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
  // config.multipart = {
  //   mode: 'file'
  // }
  // add your user config here
  const userConfig = {
    myAppName: 'im',
    // mongoose
    mongoose: {
      url: 'mongodb://localhost:27017/im', // connect to other docker image port: 27017
      options: {},
    },
    redis: {
      client: {
        port: 6379,          // Redis port
        host: 'localhost',   // Redis host
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
    nunjucks: {
      cache: false,
    },

    io: {
      // io like server
      // init options see that, options use io.attach to server
      // https://socket.io/docs/server-api/#Server
      init: {
        path: '/ws',
        origins: '*:*',
      },
      namespace: {
        '/sso': {
          connectionMiddleware: [ 'ssoconnection' ],
        },
        '/chat': {
          connectionMiddleware: [ 'chatconnection' ],
        },
      },
    },
    session: {
      encrypt: false,
      signed: false,
      renew: true,
      key: 'EGG_SESS',
      maxAge: 24 * 3600 * 1000,
    },
    view: {
      defaultViewEngine: 'nunjucks',
      mapping: {
        '.html': 'nunjucks',
      },
      cache: false,
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

  // io emit cheatsheet config
  const ioConfig = {
    emitsheet: {
      SSO: 'sso',
      SSO_QRLOGIN: 'qrlogin',
      CHAT: 'chat',
      CHAT_TO: 'to',
      CHAT_ONLINE: 'online',
      CHAT_MESSAGE: 'message_s',
    },
  };

  return {
    ...config,
    ...userConfig,
    ...ioConfig,
  };
};
