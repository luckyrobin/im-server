'use strict';

module.exports = app => {
  // 课程类型
  const mongoose = app.mongoose;
  // 创建了schema
  const Schema = new mongoose.Schema(
    {
      image: String,
      title: String, // 标题
      abstract: String, // 摘要
      content: String, // 内容
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  ); // 时间

  return mongoose.model('notice', Schema); // 把model类return出去
};
