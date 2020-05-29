'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema(
    {
      content: String,
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  );

  return mongoose.model('note', Schema);
};
