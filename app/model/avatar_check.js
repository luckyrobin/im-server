'use strict';

module.exports = app => {
  // 课程类型
  const mongoose = app.mongoose;
  // 创建了schema
  const Schema = new mongoose.Schema(
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      status: {
        // 0 未审核  1. 通过 2. 拒绝  3. 已撤销
        type: Number,
        default: 0,
      },
      name: String,
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  ); // 时间

  return mongoose.model('avatar_check', Schema); // 把model类return出去
};
