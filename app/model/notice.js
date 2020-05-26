'use strict';

module.exports = app => {
  // 课程类型
  const mongoose = app.mongoose;
  // 创建了schema
  const Schema = new mongoose.Schema(
    {
      image: String,
      title: {
        type: String,
        required: true,
      }, // 标题
      abstract: String, // 摘要
      content: {
        type: String,
        required: true,
      },
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  ); // 时间

  return mongoose.model('notice', Schema); // 把model类return出去
};
