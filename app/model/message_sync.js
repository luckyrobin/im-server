'use strict';

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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      background: true,
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    typeu: {
      type: Number,
      enum: [ 1, 2, 3 ], // 1: c2c 消息 2: c2g 消息 3: 系统消息
      required: true,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageStore',
      required: true,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
  }, { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } });

  Schema.pre('find', function(next) {
    this.select('timelineId owner from typeu message')
      .populate({ path: 'message', select: '_id timelineId from to type typeu content sequenceId send_time readed fp' });
    next();
  });

  return mongoose.model('MessageSync', Schema);
};
