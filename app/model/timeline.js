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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
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
      required: true,
    },
  }, {
    timestamps: { createdAt: 'create_time', updatedAt: 'update_time' },
  });

  Schema.pre('find', function(next) {
    this.select('_id top mute owner to typeu alias avatar message update_time')
      .populate({ path: 'message', select: '_id timelineId from to type typeu content sequenceId send_time' });
    next();
  });

  return mongoose.model('Timeline', Schema);
};
