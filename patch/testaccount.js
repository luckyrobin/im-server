'use strict';

module.exports = redis => {
  // 生成 AppStore 测试账号的验证码
  // AppStore 测试号码 15811111111, 15822222222
  redis.set('15811111111', 123456);
  redis.set('15822222222', 123456);
};
