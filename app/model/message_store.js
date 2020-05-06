'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema({
    _id: {
      type: String,
      unique: true,
      index: true,
      background: true,
      required: true,
    },
    timelineId: {
      type: String,
      index: true,
      background: true,
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      index: true,
      background: true,
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      background: true,
      required: true,
    },
    type: {
      type: Number,
      enum: [ 1, 2, 3 ], // 消息类型 1: 文本消息 2: 图片消息 3: 语音消息
    },
    content: String,
    typeu: {
      type: Number,
      enum: [ 1, 2 ], // 1: c2c 消息 2: c2g 消息
    },
    sequenceId: String,
  }, { timestamps: { createdAt: 'send_time', updatedAt: 'update_time' } });

  return mongoose.model('MessageStore', Schema);
};
