'use strict';

module.exports = app => {
  // 课程类型
  const mongoose = app.mongoose;
  // 创建了schema
  const Schema = new mongoose.Schema(
    {
      content: String,
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  ); // 时间

  return mongoose.model('note', Schema); // 把model类return出去
};
