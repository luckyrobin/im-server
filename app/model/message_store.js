'use strict';

const uniqueValidator = require('mongoose-unique-validator');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema({
    timelineId: {
      type: String,
      ref: 'Timeline',
      index: true,
      background: true,
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      enum: [ 1, 2, 3, 10 ], // 消息类型 1: 文本消息 2: 图片消息 3: 语音消息 10: 被撤回的消息
      required: true,
    },
    content: String,
    typeu: {
      type: Number,
      enum: [ 1, 2, 3, 4 ], // 1: c2c 消息 2: c2g 消息 3: 系统消息 4: 公告消息
      required: true,
    },
    sequenceId: {
      type: String,
      required: true,
    },
    readed: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    fp: {
      type: String,
      unique: true,
      required: true,
    },
  }, { timestamps: { createdAt: 'send_time', updatedAt: 'update_time' } });

  Schema.pre('find', function(next) {
    this.select('_id timelineId from to type typeu content sequenceId send_time readed fp');
    next();
  });

  Schema.plugin(uniqueValidator);

  return mongoose.model('MessageStore', Schema);
};
