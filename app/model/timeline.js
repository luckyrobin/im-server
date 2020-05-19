'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  // custom _id not need unique and index
  // issue: https://github.com/Automattic/mongoose/issues/8462#issuecomment-570553272
  const Schema = new mongoose.Schema({
    _id: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      background: true,
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
    avatar: String,
    top: {
      type: Boolean,
      default: false,
    },
    mute: {
      type: Boolean,
      default: false,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageStore',
    },
  }, {
    timestamps: { createdAt: 'create_time', updatedAt: 'update_time' },
  });

  Schema.pre('find', function(next) {
    this.select('_id top mute owner to typeu alias avatar message update_time')
      .populate({ path: 'message', select: '_id timelineId from to type typeu content sequenceId send_time readed fp' });
    next();
  });

  return mongoose.model('Timeline', Schema);
};
