'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema(
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: Number,
        enum: [ 0, 1, 2, 3 ], // 状态值 0: 未审核  1: 通过  2: 拒绝  3: 已撤销
        default: 0,
      },
      name: String,
      avatar: {
        type: String,
        required: true,
      },
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  );
  return mongoose.model('avatar_check', Schema);
};
