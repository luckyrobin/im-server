'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema(
    {
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        background: true,
        required: true,
      },
      timeline: {
        type: String,
        ref: 'Timeline',
        required: true,
      },
      messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MessageStore',
        required: true,
      }],
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  );

  Schema.pre('find', function(next) {
    this.select('owner timeline messages create_time')
      .populate({ path: 'timeline', select: '_id' })
      .populate({ path: 'messages', select: '_id' });
    next();
  });

  return mongoose.model('Favorites', Schema);
};
