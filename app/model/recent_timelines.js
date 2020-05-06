'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema({
    timelineId: {
      type: String,
      index: true,
      background: true,
      required: true,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    typeu: {
      type: Number,
      enum: [ 1, 2 ], // 1: c2c 消息 2: c2g 消息
    },
    alias: String,
    top: {
      type: Boolean,
      default: false,
    },
    mute: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      ref: 'MessageStore',
      required: true,
    },
  }, {
    timestamps: { createdAt: 'create_time', updatedAt: 'update_time' },
  });

  return mongoose.model('RecentTimelines', Schema);
};
