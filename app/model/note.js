'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema(
    {
      content: String,
      status: {
        type: Number,
        enum: [ 0, 1 ], // 状态值 0: 已推送  1: 已撤回
        default: 0,
      },
      creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MessageStore',
      },
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  );

  return mongoose.model('note', Schema);
};
