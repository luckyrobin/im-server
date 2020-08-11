/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');

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
  config.middleware = [ 'errorhandle' ];
  config.multipart = {
    fileSize: '10mb',
    mode: 'stream',
    whitelist: [ '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.wav' ],
  };

  config.customLogger = {
    scheduleLogger: {
      consoleLevel: 'ERROR',
      level: 'ERROR',
    },
  };

  config.logger = {
    dir: path.join(appInfo.baseDir, 'logs', appInfo.name),
  };

  config.logrotator = {
    filesRotateBySize: [ './egg-schedule.log', './im-server-web' ],
  };

  // add your user config here
  const userConfig = {
    myAppName: 'im', // 应用名称
    redisTokenPrefix: 'rft:', // refresh token 前缀字符
    globalchannel: 'GLOBALCHANNEL', // redis 消息队列名称
    customAgents: {
      AGENT_TO: 'agent_to', // 发送消息定时任务名称
    },
    noteMessgeObjectId: 'NOTE_MESSAGE',
    noticeMessgeObjectId: 'NOTICE___MSG',
    recallExpiresIn: 60 * 2, // 消息撤回时效
    // mongoose
    mongoose: {
      url: `mongodb://root:123456@${process.env.docker_db}`, // connect to other docker image port: 27017
      options: {
        dbName: 'im',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      },
    },
    redis: {
      client: {
        port: 6379, // Redis port
        host: process.env.docker_redis, // Redis host
        password: '123456',
        db: 0,
      },
      agent: true,
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
          packetMiddleware: [ 'chatfilter' ],
        },
      },
      redis: {
        host: process.env.docker_redis,
        port: 6379,
        auth_pass: '123456',
        db: 0,
      },
    },
    jwt: {
      secret: config.keys,
      options: {
        expiresIn: 60 * 60 * 5, // Access Token 过期时间
        rftExpiresIn: 60 * 60 * 24 * 7, // Refresh Token 过期时间
      },
    },
    view: {
      defaultViewEngine: 'nunjucks',
      mapping: {
        '.html': 'nunjucks',
      },
      cache: false,
    },
  };

  // io emit cheatsheet config
  const ioConfig = {
    emitsheet: {
      /**
       * 通用 Error 事件
      */
      IMERROR: 'im_error',
      /**
       * namespace: sso
      */
      SSO: 'sso',
      /**
       * PC 端扫码登录
      */
      SSO_QRLOGIN: 'qrlogin',
      /**
       * namespace: chat
      */
      CHAT: 'chat',
      /**
       * 客户端发送消息事件
      */
      CHAT_TO: 'to',
      /**
       * 服务端推送收到消息回执
      */
      CHAT_TO_ACK: 'to_ack',
      /**
       * 服务端推送当前在线所有用户
      */
      CHAT_ONLINE: 'c_online',
      /**
       * 服务端推送消息事件
      */
      CHAT_MESSAGE: 'c_message',
      /**
       * 客户端收到消息回执
      */
      CHAT_MESSAGE_ACK: 'c_message_ack',
      /**
       * 服务端推送群变更消息
      */
      CHAT_GROUP_NOTICE: 'g_notice',
      /**
       * 服务端推送最近会话列表
      */
      CHAT_PULL_RECENT_CONVERSATION: 'recent_conversation',
      /**
       * 服务端推送离线消息
      */
      CHAT_PULL_OFFLINE_MESSAGE: 'offline_message',
      /**
       * 服务端推送历史消息
      */
      CHAT_PULL_HISTORY_MESSAGE: 'history_message',
      /**
       * 客户端标记已读
      */
      CHAT_TO_READED: 'to_reader',
      /**
       * 客户端标记输入中状态
      */
      CHAT_TO_TYPING: 'to_typing',
      /**
       * 客户端撤回消息
      */
      CHAT_TO_UNDO: 'to_undo',
    },
    roomprefix: 'ROOM',
  };

  const statusCode = {
    errorCode: {
      RE_LOGIN: {
        code: 401,
        msg: 'Re login',
      },
      AUTH_FAILED: {
        code: 403,
        msg: 'Auth failed',
      },
      MISS_PARAMS: {
        code: 10002,
        msg: 'Parameter absent',
      },
      DB_VALID_FAILED: {
        code: 10003,
        msg: 'DB Valid failed',
      },
      DUPLICATE_VALUE: {
        code: 10004,
        msg: 'Duplicate value',
      },
      CHAT_FAILED: {
        code: 20003,
        msg: 'Send message failed',
      },
      DUPLICATE_CLIENT: {
        code: 20004,
        msg: 'you are sign in on other device',
      },
      USER_NOT_EXIST: {
        code: 20005,
        msg: 'User does not exists',
      },
      CODE_EXPIRED: {
        code: 20006,
        msg: 'Code Expired',
      },
      CODE_VALID_FAILED: {
        code: 20007,
        msg: 'Code valid failed',
      },
      FILE_ERROR: {
        code: 20008,
        msg: 'Upload File failed',
      },
    },
  };

  return {
    ...config,
    ...userConfig,
    ...ioConfig,
    ...statusCode,
  };
};
