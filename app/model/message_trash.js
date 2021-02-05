'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      background: true,
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MessageStore',
        required: true,
      },
    ],
  }, { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } });

  return mongoose.model('MessageTrash', Schema);
};
