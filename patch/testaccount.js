'use strict';

module.exports = async (redis, mongoose) => {
  // 生成 AppStore 测试账号的验证码
  // AppStore 测试号码 15811111111, 15822222222
  redis.set('15811111111', 123456);
  redis.set('15822222222', 123456);

  const userModel = mongoose.model('User');

  if (!(await userModel.exists({ phone_number: '15811111111' }))) {
    userModel.create([
      {
        name: 'Administrator',
        phone_number: '15811111111',
        auth: 1,
        sex: 1,
        email: 'admin@mail.com',
        job: 'Administrator',
        menuRole: [ 1, 2, 3 ],
      },
      {
        name: 'User',
        phone_number: '15822222222',
        auth: 2,
        sex: 1,
        email: 'user@mail.com',
        job: 'User',
        menuRole: [],
      },
    ]);
  }
};
