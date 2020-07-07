'use strict';
// 联系人备注

module.exports = app => {
  const mongoose = app.mongoose;
  // 创建了schema
  const Schema = new mongoose.Schema(
    {
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: String,
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  );

  return mongoose.model('remark', Schema);
};
