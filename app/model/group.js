'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema({
    name: String,
    avatar: String,
    notice: String,
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      background: true,
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      background: true,
      required: true,
    }],
  }, {
    timestamps: { createdAt: 'create_time', updatedAt: 'update_time' },
    writeConcern: { w: 'majority', wtimeout: 1000 },
  });

  return mongoose.model('Group', Schema);
};
